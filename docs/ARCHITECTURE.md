# Fruit Storage Architecture

## References

### Resources supplied with the entry task

- [DDD Forum example project](https://github.com/stemmlerjs/ddd-forum)
- [Clean Architecture](https://medium.com/@rudrakshnanavaty/clean-architecture-7c1b3b4cb181)
- [Value Objects in TypeScript](https://khalilstemmler.com/articles/typescript-value-object/)
- [Domain Services](https://aspnetboilerplate.com/Pages/Documents/Domain-Services)
- [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html)
- [Node Cron](https://www.npmjs.com/package/node-cron)

### Related project documentation

- [[Entry Task]]
- [[Fruit Storage Assumptions]]
- [[Fruit Storage Domain]]
- [[Fruit Storage Use-Cases]]
- [[Fruit Storage Acceptance Tests]]
- [[Outbox Publisher]]

---

## 1. Purpose and scope

Fruit Storage manages fruit definitions and the quantity of each fruit currently stored. Clients access the same application behavior through a frontend, REST endpoints, and GraphQL queries and mutations.

The architecture separates fruit-storage business behavior from transport, framework, persistence, and event-delivery concerns. Authentication, authorization, and behavior not required by the entry task are outside the current scope.

## 2. Architectural drivers

| Driver | Architectural effect |
| --- | --- |
| Domain-driven design | Business rules are represented by an aggregate, value objects, a domain service, a factory, repository abstractions, and domain events. |
| Clean Architecture | Dependencies point toward the domain; technical frameworks remain replaceable adapters. |
| REST and GraphQL | Two presentation adapters invoke the same application use cases. |
| Description limited to 30 characters | A `FruitDescription` value object prevents invalid descriptions from entering the aggregate. |
| Case-insensitively unique names | A normalized `FruitName`, a domain uniqueness check, and a MongoDB unique index protect the rule. |
| Factory creation | New Fruits are constructed through a factory rather than directly by controllers or resolvers. |
| Repository retrieval | Application behavior accesses Fruits through an interface rather than Mongoose. |
| MongoDB and Mongoose | Persistence is implemented as an infrastructure adapter. Query results use `.lean()`. |
| Database/domain mapping | A mapper translates plain persistence records to domain objects and back. |
| At-least-once event delivery | Fruit state and pending events are saved atomically through a transactional outbox and retried by a scheduled publisher. |
| Testability | Domain rules run without NestJS or MongoDB; adapters and transactions are covered separately. |

NestJS is the composition mechanism, Jest is the test runner, and Nexus defines the GraphQL schema. These technologies must not leak into the domain model.

## 3. Layers and dependency direction

### Presentation

REST controllers, GraphQL resolvers, and the frontend-facing transport models:

- validate and translate transport input;
- invoke an application use case; and
- translate results and errors into protocol-specific output.

They do not implement Fruit rules or query Mongoose directly.

### Application

The application layer contains the seven use cases:

- Create Fruit
- Update Fruit
- Delete Fruit
- Store Fruit
- Remove Fruit
- Find Fruit
- List Fruits

A use case coordinates repository access, domain behavior, transaction boundaries, and returned results. It does not duplicate aggregate invariants.

### Domain

The domain contains:

- the `Fruit` aggregate root;
- `FruitName` and `FruitDescription` value objects;
- the Fruit factory;
- the fruit-name uniqueness domain service;
- repository and publisher-facing abstractions required by inner layers;
- domain events; and
- domain errors.

The domain has no dependency on NestJS, Mongoose, MongoDB, REST, GraphQL, Nexus, or node-cron.

### Infrastructure

Infrastructure contains:

- Mongoose schemas and repository adapters;
- persistence mappers;
- MongoDB transaction handling;
- the transactional outbox;
- the scheduled outbox publisher; and
- the initial internal event-bus/audit publisher adapter.

NestJS provider bindings connect interfaces to these implementations at the composition root.

### Dependency rule

~~~text
Presentation -> Application -> Domain
Infrastructure -> interfaces owned by Application or Domain
~~~

The arrows mean “may depend on.” Domain code never points outward to infrastructure or presentation.

## 4. Domain model

### Fruit aggregate root

A Fruit owns the state that must remain consistent together:

- immutable identity;
- display name and normalized comparison name;
- description;
- storage limit;
- stored amount; and
- uncommitted domain events.

State changes occur only through Fruit operations such as `update`, `store`, `remove`, and deletion verification. The name is established during creation and is not changed by the update use case.

The aggregate enforces these invariants:

- the description contains no more than 30 characters;
- the storage limit is not negative;
- the stored amount is never negative;
- the stored amount never exceeds the storage limit;
- storage and removal amounts are positive integers; and
- a non-empty Fruit cannot be deleted unless force deletion is requested.

Name uniqueness is a collection-wide rule, so the Fruit aggregate cannot enforce it alone.

### Value objects

`FruitDescription` validates and compares description text by value.

`FruitName` retains the trimmed display form and produces one normalized value for lookup and uniqueness comparison. The same normalization rule is used by REST, GraphQL, the repository, and the MongoDB unique index.

### Fruit-name uniqueness domain service

The uniqueness service asks a repository abstraction whether a normalized name already exists. It provides an understandable domain-level rejection. A unique database index is still required because two concurrent requests can pass the initial check before either saves.

A duplicate-key persistence error is translated into the same application error as the domain uniqueness check.

### Fruit factory

The factory receives validated creation values and creates a Fruit with a stored amount of zero. It records `FruitCreated`. It does not save to MongoDB and does not replace the collection-wide uniqueness check.

## 5. Persistence seam

The domain works with Fruit aggregates. MongoDB works with persistence-shaped records. These representations are related but are not the same object.

### Repository interface

The interface is derived from application needs and initially supports operations equivalent to:

~~~text
existsByNormalizedName(normalizedName)
findByName(name)
list()
save(fruit)
delete(fruit)
~~~

The exact TypeScript signatures are defined during implementation. Methods are added only when a use case requires them.

### Mongoose repository adapter

The adapter:

- executes MongoDB queries;
- uses `.lean()` for query results;
- passes plain objects to the mapper;
- persists mapped Fruit state;
- participates in MongoDB transactions; and
- translates persistence failures into application-facing errors.

### Mapper

The mapper translates in both directions:

~~~text
MongoDB plain object <-> Fruit aggregate
~~~

It reconstructs already-persisted state without replaying creation behavior or emitting new domain events. Business decisions remain in the domain, not in the mapper.

## 6. Representative Create Fruit flow

~~~text
REST controller or GraphQL resolver
    -> validates and translates input

CreateFruit application use case
    -> checks normalized-name availability through an interface
    -> invokes the Fruit factory
    -> asks the repository to persist the change

Fruit factory
    -> creates a valid Fruit
    -> records FruitCreated

Mongoose repository and transaction adapter
    -> maps and stores the Fruit document
    -> stores the pending outbox event in the same transaction

MongoDB
    -> commits both records or neither record
~~~

REST and GraphQL start through different adapters but invoke the same `CreateFruit` use case. The MongoDB unique index closes the race between the preliminary uniqueness check and persistence.

## 7. Domain-event delivery

The domain records an event when a valid operation changes the Fruit. Infrastructure is responsible for delivering that event.

The entry task explicitly requires events for:

- `FruitCreated`;
- `FruitUpdated`; and
- `FruitDeleted`.

This design additionally records `FruitStored` and `FruitRemoved` because successful inventory changes are meaningful domain occurrences. Failed operations record no event.

### Transactional outbox

~~~text
Begin MongoDB transaction
    -> save Fruit state
    -> save pending outbox records
Commit both or roll back both
~~~

A scheduled publisher then:

1. claims eligible pending events;
2. publishes them through an `EventPublisher` interface;
3. marks successful deliveries; and
4. retains failed deliveries for retry with backoff.

The initial publisher dispatches to an internal application event bus with an audit handler. The interface allows a broker or external service to replace that destination later without changing the domain or use cases.

Polling creates a configurable delivery delay. Durable pending records survive application restarts and destination failures, but publication only progresses while a publisher instance is running. A crash after publication but before marking delivery can produce a duplicate; therefore every event has a stable identifier and consumers must be idempotent.

## 8. Testing relationship

| Test level | Responsibility |
| --- | --- |
| Domain unit | Value objects, aggregate invariants, factory behavior, and domain errors without NestJS or MongoDB. |
| Application unit | Use-case coordination with in-memory or mocked ports. |
| Integration | Mapper, Mongoose repository, unique index, transactions, and atomic Fruit/outbox persistence against a replica set. |
| End-to-end | REST and GraphQL transport behavior through the complete application. |

Tests follow the same public seams used by production code and avoid testing private helper implementation details.

## 9. Confirmed decisions and open questions

### Confirmed

- Names are trimmed and compared case-insensitively.
- The preferred display form is retained separately from the normalized comparison value.
- Description length means 30 characters, including spaces.
- A Fruit may be created with a storage limit of zero but never a negative limit.
- Reducing the limit below the stored amount is rejected.
- REST and GraphQL share application use cases.
- Domain events use a transactional outbox and scheduled retrying publisher.
- The initial publication destination is an internal event bus/audit handler.
- Store and remove operations emit additional domain events on success.

### Still open or requiring confirmation

- Whether force deletion is implemented as soft deletion.
- Whether an amount represents individual pieces or another unit.
- Which optimistic-concurrency policy protects simultaneous updates to one Fruit.
- How multiple publisher instances coordinate event claims.
- How long delivered outbox records are retained.

Open questions must remain visible until an assumption or ADR resolves them.

## 10. Architectural decision records

- [[docs/adr/0001-fruit-is-the-aggregate-root.md|ADR 0001 — Fruit is the aggregate root]]
- [[docs/adr/0002-fruit-names-are-case-insensitively-unique.md|ADR 0002 — Fruit names are case-insensitively unique]]
- [[docs/adr/0003-rest-and-graphql-share-application-use-cases.md|ADR 0003 — REST and GraphQL share application use cases]]
- [[docs/adr/0004-domain-events-use-a-transactional-outbox.md|ADR 0004 — Domain events use a transactional outbox]]