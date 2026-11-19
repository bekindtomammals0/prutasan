# Fruit Storage Entry Task — Start-to-Finish Implementation Guide

## 1. Purpose of this guide

This guide converts the existing project documentation into an implementation sequence for the Fruit Storage entry task.

It is designed to prevent three common failures:

1. building framework code before the domain is understood;
2. writing all tests before learning from the first implementation slice; and
3. mixing domain behavior, persistence, transport, and event-delivery responsibilities.

Follow the guide in order. Do not begin a later phase merely because its folder can already be created. Each phase has an exit check that must pass first.

The implementation method is:

```text
Read the relevant documentation
        ↓
Choose one public behavior
        ↓
Write one failing test
        ↓
Write the minimum implementation
        ↓
Make the test pass
        ↓
Review what the cycle taught you
        ↓
Update documentation if understanding changed
        ↓
Begin the next behavior
```

Do not write all tests first. Do not implement all layers horizontally. Complete one small vertical behavior at a time.

---

## 2. Documentation map

Use the existing documentation as the source of truth for different questions.

| Document | Question it answers | Read it when |
|---|---|---|
| `Fruit Storage Assumptions` | How were ambiguous requirements interpreted? | Before implementing an uncertain behavior |
| `Fruit Storage Domain` | What terms, state, operations, and invariants exist? | Before every domain test |
| `Fruit Storage Use-Cases` | What sequence completes each user intention? | Before implementing an application use case |
| `Fruit Storage Acceptance Tests` | What externally observable outcomes must pass? | Before end-to-end implementation and verification |
| `Fruit Storage Architecture` | Where does each responsibility belong? | Before introducing a module or dependency |
| `0001-fruit-is-the-aggregate-root` | Why Fruit owns definition and inventory state | Before implementing `Fruit` |
| `0002-fruit-names-are-case-insensitively-unique` | How names are normalized and protected | Before `FruitName`, uniqueness checks, and indexes |
| `0003-rest-and-graphql-share-application-use-cases` | Why transports reuse the same behavior | Before REST or GraphQL |
| `0004-domain-events-use-a-transactional-outbox` | How changes and event records remain consistent | Before persistence transactions and publishing |

### Documentation rule

If implementation contradicts a document, stop and determine which is wrong. Do not silently make the code and documentation disagree.

If a decision changes:

1. update the applicable assumption or domain rule;
2. update affected use cases and acceptance tests;
3. revise or supersede the ADR; and
4. only then change the implementation.

---

## 3. Required scope

### Backend

- NestJS
- MongoDB with Mongoose
- Mongoose queries use `.lean()`
- REST CRUD operations
- GraphQL with Nexus-generated schema
- five GraphQL mutations:
  - `createFruitForFruitStorage`
  - `updateFruitForFruitStorage`
  - `deleteFruitFromFruitStorage`
  - `storeFruitToFruitStorage`
  - `removeFruitFromFruitStorage`
- two GraphQL queries:
  - `findFruit`
  - `listFruits`
- Jest tests
- domain events for create, update, and delete
- at-least-once event delivery

### Frontend

Build only enough interface to demonstrate the required behaviors. The frontend may use one transport consistently; both REST and GraphQL are still verified independently through backend end-to-end tests.

### Initially out of scope unless clarified

- authentication and authorization;
- external message-broker provisioning;
- cloud deployment;
- multiple warehouses;
- event sourcing;
- complex distributed locking;
- events for store and remove, unless deliberately retained as an extension; and

---

## 4. Decisions to freeze before coding

Record these in `Fruit Storage Assumptions` or the appropriate ADR.

### 4.1 Fruit identity

Use separate fields:

```text
id: immutable generated identifier
displayName: user-facing trimmed name
normalizedName: trimmed and case-normalized uniqueness key
```

Do not use `normalizedName` as the permanent entity ID. This keeps entity identity independent from future normalization-policy changes.

### 4.2 Name mutability

The mutation named `updateFruitForFruitStorage` uses `name` to identify the Fruit. Unless clarified otherwise, treat the name as immutable after creation. The update changes description and storage limit.

### 4.3 Description measurement

Decide what “30 letters” means. A reasonable documented assumption is a maximum of 30 Unicode characters, not 30 bytes. Add boundary tests for exactly 30 and 31.

### 4.4 Initial inventory

A newly created Fruit begins with:

```text
storedAmount = 0
```

### 4.5 Required events

Implement first:

- `FruitCreated`
- `FruitUpdated`
- `FruitDeleted`
- `FruitStored`
- `FruitRemoved`

### 4.6 Event destination

The task does not specify an external destination. Define an `EventPublisher` interface so the destination remains replaceable. If clarification is unavailable, use a simple demonstrable adapter and document that the assessment focuses on durable outbox storage, retries, and at-least-once processing rather than a production broker.

---

## 5. Layer responsibility reference

Use this classifier whenever a new behavior appears:

```text
Receive external input → Presentation
Coordinate a user goal → Application
Decide business validity → Domain
Connect to technology → Infrastructure
```

### Presentation

Owns:

- REST controllers;
- GraphQL resolvers and Nexus types;
- transport input validation;
- response formatting; and
- mapping application errors to HTTP or GraphQL errors.

Must not own:

- storage-limit rules;
- deletion rules;
- uniqueness behavior;
- Mongoose queries; or
- outbox publication logic.

### Application

Owns:

- `CreateFruit`;
- `UpdateFruit`;
- `DeleteFruit`;
- `StoreFruit`;
- `RemoveFruit`;
- `FindFruit`; and
- `ListFruits`.

Application use cases coordinate work. They do not reimplement aggregate invariants.

### Domain

Owns:

- `Fruit` aggregate;
- `FruitName`;
- `FruitDescription`;
- Fruit factory;
- fruit-name uniqueness domain service;
- domain events;
- domain errors; and
- persistence interfaces needed by domain/application behavior.

The Domain must not import NestJS, Mongoose, MongoDB, Nexus, REST, or GraphQL.

### Infrastructure

Owns:

- Mongoose schemas;
- MongoDB queries;
- repository adapters;
- mappers;
- unique indexes;
- transactions;
- optimistic-concurrency persistence;
- outbox persistence;
- the scheduled publisher; and
- NestJS composition/provider bindings.

### Dependency direction

```text
Presentation → Application → Domain
Infrastructure → interfaces owned by inner layers
```

Runtime execution may reach Infrastructure, but the Application imports only inward-owned interfaces.

---

## 6. Initial public seams

Tests should verify behavior through these seams rather than through private helpers.

Names may be adjusted before the first test, but once selected they should change only for a justified design improvement.

### Domain seams

```text
FruitName.create(rawName)
FruitDescription.create(rawDescription)
FruitFactory.create(input)
fruit.update(description, storageLimit)
fruit.store(amount)
fruit.remove(amount)
fruit.verifyDeletionAllowed(forceDelete)
fruit.pullDomainEvents()
```

### Application seams

```text
CreateFruit.execute(command)
UpdateFruit.execute(command)
DeleteFruit.execute(command)
StoreFruit.execute(command)
RemoveFruit.execute(command)
FindFruit.execute(query)
ListFruits.execute(query)
```

### Persistence seam

The exact interface should be no larger than the use cases require:

```text
FruitRepository.findByNormalizedName(name)
FruitRepository.list()
FruitRepository.save(fruit)
FruitRepository.delete(fruit)
```

The production adapter atomically persists Fruit changes and pending domain-event records. The in-memory adapter supports application tests without MongoDB.

---

## 7. Suggested project structure

Keep the structure small and organized around the Fruit module.

```text
project/
├── backend/
│   ├── src/
│   │   ├── fruit/
│   │   │   ├── domain/
│   │   │   │   ├── fruit.ts
│   │   │   │   ├── fruit-name.ts
│   │   │   │   ├── fruit-description.ts
│   │   │   │   ├── fruit-factory.ts
│   │   │   │   ├── fruit-name-uniqueness.ts
│   │   │   │   ├── fruit-repository.ts
│   │   │   │   ├── events/
│   │   │   │   └── errors/
│   │   │   ├── application/
│   │   │   │   ├── create-fruit.ts
│   │   │   │   ├── update-fruit.ts
│   │   │   │   ├── delete-fruit.ts
│   │   │   │   ├── store-fruit.ts
│   │   │   │   ├── remove-fruit.ts
│   │   │   │   ├── find-fruit.ts
│   │   │   │   └── list-fruits.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── fruit.schema.ts
│   │   │   │   │   ├── fruit-mapper.ts
│   │   │   │   │   └── mongoose-fruit-repository.ts
│   │   │   │   └── events/
│   │   │   │       ├── outbox.schema.ts
│   │   │   │       ├── outbox-publisher.ts
│   │   │   │       └── event-publisher.ts
│   │   │   ├── presentation/
│   │   │   │   ├── rest/
│   │   │   │   └── graphql/
│   │   │   └── fruit.module.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── integration/
│   │   └── e2e/
│   └── package.json
├── frontend/
└── docs/
    └── adr/
```

Do not create empty files for every future class on the first day. Create each file when its first behavior is implemented.

---

## 8. Phase 0 — Project setup

### Work

1. Create backend and frontend workspaces.
2. Configure TypeScript strictness.
3. Configure ESLint and formatting.
4. Configure Jest.
5. Configure environment validation for database and publisher settings.
6. Configure MongoDB for transactions using a replica set, including idempotent
   initialization from a fresh volume and integration tests. The hostname in
   `MONGODB_URI` must be reachable by the test process and must match
   `MONGODB_REPLICA_SET_HOST`, which MongoDB advertises to clients.
   For host-run tests, export `MONGODB_REPLICA_SET_HOST=localhost` and use
   `MONGODB_URI=mongodb://localhost:27017/fruit_storage?replicaSet=rs0`. Start
   MongoDB with `docker compose -f backend/compose.yaml up -d --wait` so it is
   initialized and primary before testing. For tests inside the Compose network,
   set both values to use the `mongodb` hostname, and pass
   `MONGODB_REPLICA_SET_HOST` to both Compose and the test runner.
7. Add commands for linting, type checking, unit tests, integration tests, end-to-end tests, and builds.
8. Add a pre-commit hook only after the commands are stable and reasonably fast.

### Do not do yet

- Do not implement controllers.
- Do not implement schemas.
- Do not implement node-cron.
- Do not build a detailed frontend.

### Exit check

- A deliberately failing Jest test is detected.
- Lint and type-check commands run.
- An integration test proves that writes to the temporary `phase0_fruits` and
  `phase0_outbox` collections commit or roll back together, without defining
  the Fruit schema.
- The backend starts with an empty Fruit module.
- MongoDB starts as a ready replica set from a fresh volume.
- The frontend starts with a placeholder screen.

---

## 9. Phase 1 — Value objects

Use one red-green cycle per behavior.

### 9.1 FruitDescription

Recommended order:

1. description longer than 30 characters is rejected;
2. exactly 30 characters is accepted;
3. a normal description is accepted;
4. decide and test empty-description behavior according to assumptions; and
5. two descriptions containing the same text compare by value.

Test through `FruitDescription.create()` or the chosen public constructor. Do not test private length helpers.

### 9.2 FruitName

Recommended order:

1. leading and trailing whitespace is trimmed;
2. normalized comparison is case-insensitive;
3. display form and normalized form remain distinguishable;
4. empty names are rejected; and
5. equivalent inputs produce the same normalized value.

### Exit check

- No Domain file imports NestJS or Mongoose.
- Invalid value objects cannot be constructed through public interfaces.
- Tests describe behavior rather than implementation details.

---

## 10. Phase 2 — Fruit aggregate

Begin with a valid Fruit fixture or test factory. Each test starts from an explicit state.

### 10.1 Store behavior

Implement in this order:

1. `storedAmount=5`, `limit=10`, `store(5)` succeeds with amount 10;
2. `storedAmount=5`, `limit=10`, `store(6)` fails with amount still 5;
3. `store(0)` fails;
4. `store(-1)` fails; and
5. a non-integer amount fails.

### 10.2 Remove behavior

1. `storedAmount=5`, `remove(5)` succeeds with amount 0;
2. `storedAmount=5`, `remove(6)` fails with amount still 5;
3. zero fails;
4. negative fails; and
5. a non-integer fails.

### 10.3 Update behavior

1. valid description and limit update succeeds;
2. invalid description fails without partial state change;
3. negative limit fails;
4. a limit below stored amount fails without changing state; and
5. a limit equal to stored amount succeeds.

### 10.4 Deletion rule

1. empty Fruit with `forceDelete=false` is allowed;
2. non-empty Fruit with `forceDelete=false` is rejected; and
3. non-empty Fruit with `forceDelete=true` is allowed.

The aggregate verifies permission. It does not import Mongoose or delete its document.

### 10.5 Domain events

Add required event recording when the related behavior exists:

- factory records `FruitCreated`;
- successful update records `FruitUpdated`; and
- successful deletion decision records `FruitDeleted` before persistence.

Do not record an event for a rejected operation.

### Exit check

- Every invariant is protected by the aggregate or a value object.
- Failed operations leave state unchanged.
- Domain tests require no NestJS, MongoDB, or network.
- Domain events are data describing past facts; they do not publish themselves.

---

## 11. Phase 3 — Factory and identity

### Factory responsibilities

The factory:

- accepts valid creation input;
- creates or receives an immutable generated Fruit ID;
- creates `FruitName` and `FruitDescription` values;
- sets `storedAmount` to zero;
- establishes the storage limit;
- constructs a valid Fruit; and
- records `FruitCreated`.

The factory does not:

- query MongoDB;
- publish events;
- write an outbox record; or
- coordinate the complete create use case.

### Tests

1. valid input creates a Fruit with amount zero;
2. invalid values prevent construction;
3. ID remains separate from normalized name; and
4. creation records one `FruitCreated` event.

### Exit check

- A valid Fruit cannot be created in an invalid initial state.
- Identity, display name, and normalized name are distinct concepts.

---

## 12. Phase 4 — Repository interface and in-memory adapter

Define only methods already required by use cases.

Create an in-memory adapter for application tests. This is a real adapter at the repository seam, not a mock of internal implementation details.

### In-memory adapter behavior

- find by normalized name;
- list Fruits;
- save a Fruit;
- delete a Fruit; and
- preserve identity across saves.

Do not claim that this adapter proves MongoDB transactions, indexes, or concurrency.

### Exit check

- Application code can retrieve and save Fruits without importing Mongoose.
- Tests can replace production persistence through the same interface.

---

## 13. Phase 5 — Application use cases

Implement one complete use case at a time. Begin with Create Fruit, because it exercises the factory, uniqueness policy, repository, and domain event.

### 13.1 CreateFruit

Expected sequence:

```text
Receive command
    ↓
Create/normalize FruitName
    ↓
Check name availability through uniqueness service
    ↓
Construct Fruit through factory
    ↓
Save through repository interface
    ↓
Return application result
```

Tests:

1. valid creation succeeds;
2. duplicate normalized name fails;
3. `Lemon`, `lemon`, and padded equivalents conflict according to the ADR;
4. invalid description fails;
5. invalid limit fails; and
6. the successful Fruit contains `FruitCreated` before persistence clears committed events.

### 13.2 StoreFruit

```text
Normalize name → retrieve Fruit → call fruit.store → save → return result
```

Tests include not found, valid exact-capacity storage, overflow, zero, negative, and unchanged state after failure.

### 13.3 RemoveFruit

```text
Normalize name → retrieve Fruit → call fruit.remove → save → return result
```

Tests include exact removal, excessive removal, not found, zero, negative, and unchanged state after failure.

### 13.4 UpdateFruit

Retrieve using the immutable existing name. Change description and limit only.

Tests include valid update, description overflow, limit below stored amount, negative limit, and not found.

### 13.5 DeleteFruit

```text
Retrieve Fruit
    ↓
Ask Fruit to verify/record deletion
    ↓
Delete through repository
    ↓
Return result
```

Tests include empty deletion, rejected non-empty deletion, forced non-empty deletion, not found, and `FruitDeleted` only for successful deletion.

### 13.6 Queries

Implement `FindFruit` and `ListFruits` after command behavior is stable.

Queries do not mutate Fruit state or record domain events.

### Exit check

- All seven use cases work with the in-memory adapter.
- Application tests do not start NestJS or MongoDB.
- Use cases coordinate; aggregates decide business validity.

---

## 14. Phase 6 — Mongoose schema and mapper

### Persistence shape

Include at least:

```text
id
displayName
normalizedName
description
storageLimit
storedAmount
version
createdAt
updatedAt
```

Add a unique index on `normalizedName`.

### Mapper responsibilities

`toDomain`:

- accepts a plain persistence-shaped object;
- reconstructs value objects;
- reconstructs the Fruit identity and state;
- rejects corrupted persistence data rather than silently creating an invalid aggregate; and
- does not generate new creation events during rehydration.

`toPersistence`:

- extracts persistence primitives from the aggregate; and
- does not decide domain validity.

### `.lean()` requirement

All retrieval queries use `.lean()` so they return plain JavaScript objects. `.lean()` does not produce a domain Fruit; the mapper still reconstructs it.

### Integration tests

1. persistence data round-trips through mapper and repository;
2. retrieved results are mapped into Fruits;
3. corrupted data fails explicitly;
4. normalized-name unique index rejects duplicates; and
5. duplicate-key errors become a meaningful duplicate-name error.

### Exit check

- No Mongoose document escapes Infrastructure.
- No domain object imports a schema.
- Mapper integration tests pass against real persistence-shaped data.

---

## 15. Phase 7 — Optimistic concurrency

Use an explicit `version` field.

### Save rule

An update based on version 1 must condition its database write on version 1 and write version 2.

```text
where id = requestedId and version = expectedVersion
set new state and version = expectedVersion + 1
```

If no document is updated, report a stale-write conflict.

### Retry rule

If retrying is appropriate:

1. reload the latest Fruit;
2. rerun the domain operation against fresh state;
3. save using the new version; and
4. bound the number of retries.

Never reuse the previously calculated state after a conflict.

### Concurrency integration test

Starting with amount 0 and limit 10:

- two requests load version 1;
- both attempt `store(6)`;
- only one version-1 write succeeds;
- the stale write is detected; and
- a retry reloads amount 6 and is rejected because 12 would exceed 10.

### Exit check

- A lost update cannot silently succeed.
- Domain invariants are rerun after reloading fresh state.

---

## 16. Phase 8 — Transactional outbox

Do not begin until this responsibility statement is clear:

> The transaction stores the Fruit change and pending outbox record. The publisher only delivers already-committed outbox records.

### Outbox record

Suggested fields:

```text
eventId
eventType
aggregateId
payload
occurredAt
status
attemptCount
nextAttemptAt
deliveredAt
lastError
claimedAt
```

### Write transaction

For create and update:

```text
Begin MongoDB transaction
    ↓
Persist Fruit
    ↓
Persist Fruit's pending outbox records
    ↓
Commit both
    ↓
Clear committed events from in-memory aggregate
```

For delete:

```text
Fruit records FruitDeleted
    ↓
Begin MongoDB transaction
    ↓
Delete Fruit document
    ↓
Persist FruitDeleted outbox record
    ↓
Commit both
```

### Required integration tests

1. Fruit and outbox record commit together;
2. outbox failure rolls back the Fruit write;
3. Fruit failure does not create an outbox record;
4. deletion and `FruitDeleted` record commit together; and
5. events are cleared from memory only after commit.

### Publisher

The scheduled publisher:

1. claims eligible pending records;
2. invokes the `EventPublisher` adapter;
3. marks successful records delivered;
4. records failure information; and
5. schedules retry with bounded backoff.

It does not:

- construct Fruits;
- validate Fruit invariants;
- retry the original use case;
- save Fruit state; or
- decide whether an event should exist.

### At-least-once failure test

Simulate:

1. publication succeeds;
2. marking delivered fails;
3. the worker restarts; and
4. the same stable event ID is published again.

Document that consumers must be idempotent.

### Publisher concurrency test

Run two publisher instances against the same pending record and verify the claiming strategy prevents simultaneous processing where practical. At-least-once delivery still permits duplicates after uncertain failures.

### Exit check

- Pending events survive application restart.
- Delivery failure never rolls back an already committed Fruit transaction.
- The publisher retries delivery only.
- Duplicate delivery is expected and documented.

---

## 17. Phase 9 — REST presentation

Implement thin controllers for required CRUD operations.

Suggested mapping:

```text
POST   /fruits         → CreateFruit
GET    /fruits         → ListFruits
GET    /fruits/:name   → FindFruit
PATCH  /fruits/:name   → UpdateFruit
DELETE /fruits/:name   → DeleteFruit
```

The delete request must provide `forceDelete` according to the documented contract.

Controllers:

- validate transport shape;
- create application commands/queries;
- invoke use cases;
- serialize results; and
- translate application errors.

Controllers do not import Mongoose models.

### Error mapping examples

Define and document consistent responses for:

- invalid input;
- Fruit not found;
- duplicate name;
- description too long;
- storage-limit violation;
- insufficient stored amount;
- deletion denied; and
- stale-write conflict.

### REST end-to-end tests

Cover each CRUD happy path plus the acceptance-test failures applicable to REST.

### Exit check

- Controllers remain thin.
- REST operations call the same use cases already tested with the in-memory adapter.
- No domain rule is duplicated in a controller.

---

## 18. Phase 10 — GraphQL with Nexus

Define Nexus types, queries, and mutations as presentation adapters.

### Required operations

```text
createFruitForFruitStorage
updateFruitForFruitStorage
deleteFruitFromFruitStorage
storeFruitToFruitStorage
removeFruitFromFruitStorage
findFruit
listFruits
```

Resolvers translate GraphQL arguments into the same application commands and queries used by REST where capabilities overlap.

GraphQL does not call REST, and REST does not call GraphQL.

### GraphQL end-to-end tests

Convert every supplied acceptance scenario into a GraphQL request and assert:

- response data;
- error behavior;
- persisted outcome; and
- required event/outbox outcome where applicable.

Also verify the generated schema contains all required operations.

### Exit check

- Nexus generates the GraphQL schema.
- All five mutations and two queries exist.
- Resolvers contain no domain or Mongoose logic.
- Acceptance scenarios pass through GraphQL.

---

## 19. Phase 11 — Minimal frontend

Choose one backend interface for the frontend. GraphQL is a reasonable choice because it exercises the required Nexus interface, but document the choice.

### Minimum screens or capabilities

- list Fruits;
- find/filter a Fruit;
- create a Fruit;
- update description and limit;
- store an amount;
- remove an amount;
- delete with force-delete confirmation; and
- display meaningful errors.

Do not duplicate domain validation in a way that becomes authoritative. Client-side validation improves feedback; the backend Domain remains authoritative.

### Exit check

- A user can exercise every required GraphQL mutation and query.
- Error messages reflect backend outcomes.
- The frontend contains no storage-limit or deletion authority independent from the backend.

---

## 20. Phase 12 — Full verification

Run verification in increasing scope:

1. formatting;
2. linting;
3. type checking;
4. domain unit tests;
5. application tests;
6. MongoDB integration tests;
7. REST end-to-end tests;
8. GraphQL end-to-end tests;
9. frontend tests, if included;
10. backend build;
11. frontend build; and
12. manual acceptance walkthrough.

### Manual acceptance walkthrough

Verify at least:

- create valid lemon;
- reject description beyond the limit;
- reject duplicate normalized name;
- update to valid description;
- reject invalid updated description;
- reject deletion of non-empty Fruit without force;
- allow forced deletion;
- store below or exactly to limit;
- reject storage above limit;
- remove exact stored amount;
- reject excessive removal;
- find existing Fruit;
- fail clearly for missing Fruit; and
- list Fruits.

Record actual commands, requests, and outcomes. Do not report a test as passing unless it was executed.

---

## 21. Phase 13 — Documentation and handoff

### README

Include:

- problem summary;
- implemented assumptions;
- installation and environment setup;
- MongoDB replica-set requirement;
- backend and frontend commands;
- REST routes;
- GraphQL endpoint and operations;
- test commands;
- architecture summary;
- transactional-outbox explanation;
- known limitations; and
- future improvements.

### Architecture documentation

Verify that it matches the implemented dependency direction and module ownership.

### ADR status

Change `Proposed` to `Accepted` only when implementation reflects the decision and relevant tests pass. If implementation intentionally differs, revise or supersede the ADR.

### Known limitations

Disclose honestly, for example:

- simple scheduled publisher rather than production broker infrastructure;
- no authentication;
- minimal frontend styling;
- bounded demonstration of consumer idempotency;
- no multi-warehouse inventory; and
- any deferred optional events.

---

## 22. Definition of done

### Domain

- [ ] Fruit invariants are enforced in the Domain.
- [ ] Invalid operations leave state unchanged.
- [ ] Description is represented by a value object.
- [ ] Name normalization is centralized.
- [ ] Fruit creation occurs through the factory.
- [ ] Name uniqueness uses a domain service.

### Application

- [ ] All five commands/mutations have application use cases.
- [ ] Both queries have application use cases.
- [ ] REST and GraphQL reuse applicable use cases.
- [ ] Application code depends on repository interfaces, not Mongoose.

### Infrastructure

- [ ] Mongoose queries use `.lean()`.
- [ ] Mapper converts persistence objects to and from domain objects.
- [ ] Normalized name has a unique database index.
- [ ] Duplicate-key errors are translated.
- [ ] Optimistic concurrency prevents silent lost updates.
- [ ] Required domain events use a transactional outbox.
- [ ] Publisher retries failed delivery.
- [ ] Duplicate delivery is handled or explicitly demonstrated as an idempotency requirement.

### Interfaces

- [ ] REST CRUD operations work.
- [ ] Nexus-generated GraphQL schema contains five mutations and two queries.
- [ ] Minimal frontend exercises the required behavior.

### Tests

- [ ] Domain unit tests pass.
- [ ] Application tests with in-memory adapters pass.
- [ ] MongoDB mapper/repository tests pass.
- [ ] Transaction/outbox tests pass against a replica set.
- [ ] REST end-to-end tests pass.
- [ ] GraphQL acceptance tests pass.
- [ ] Failed-operation tests assert unchanged state.

### Quality and documentation

- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Builds pass.
- [ ] README setup works from a clean environment.
- [ ] Architecture matches implementation.
- [ ] ADR statuses are accurate.
- [ ] Assumptions and limitations are disclosed.

---

## 23. Manual-first use of AI

For each slice, attempt the reasoning and implementation manually first.

When blocked, ask AI a narrow question containing:

1. the relevant documented rule;
2. the public seam being tested;
3. the failing test;
4. the smallest relevant implementation; and
5. what you already tried.

Good request:

> My `Fruit.store(amount)` unit test expects overflow to leave amount unchanged. The test fails because state changes before validation. Explain two ways to order validation and mutation without writing the whole module.

Avoid:

> Build the entire Fruit Storage assignment.

After receiving assistance:

1. explain the proposed change in your own words;
2. compare it against Domain and Architecture documentation;
3. implement or adapt it yourself;
4. run the relevant test;
5. add a missing regression test if the failure revealed a new case; and
6. record any changed decision.

---

## 24. Final interview preparation

Be able to explain these flows without notes:

### Create flow

```text
Presentation receives request
→ Application coordinates CreateFruit
→ Domain service checks normalized-name availability
→ Factory constructs valid Fruit and records FruitCreated
→ Repository transaction stores Fruit and outbox record
→ Publisher later delivers committed event
```

### Responsibility summary

```text
Presentation translates
Application coordinates
Domain decides
Infrastructure connects
```

### Outbox summary

```text
The transaction persists state plus the pending event.
The publisher delivers only committed events.
Delivery is at least once, so duplicates are possible.
```

### Test summary

```text
Unit tests prove domain behavior.
Application tests prove coordination through in-memory adapters.
Integration tests prove MongoDB mapping, indexes, transactions, and outbox behavior.
End-to-end tests prove REST and GraphQL behavior from the caller's perspective.
```

### Honest trade-offs

Explain:

- why Fruit is one aggregate;
- why normalized name is separate from entity ID;
- why the domain service and unique index both exist;
- why REST and GraphQL share use cases;
- why an outbox is used instead of direct publication;
- why optimistic concurrency is required; and
- what was deliberately kept simple because of assessment scope.
