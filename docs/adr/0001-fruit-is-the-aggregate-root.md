## Context

Fruit description, storage limit, and stored amount must remain consistent during updates. The stored amount must not become negative or exceed the storage limit, and the storage limit cannot be reduced below the stored amount.

A decision is required about which domain object owns this state and protects these invariants.

## Decision

Fruit will be the aggregate root

It owns:
- fruit name;
- fruit description;
- storage limit;
- stored amount; and
- domain events produced by changes to the Fruit.

All changes to this state must occur through Fruit operations such as update, store, remove, and verifyDeleteAllowed. Callers must not modify these values directly.

Application use cases retrieve and persist the complete Fruit through FruitRepository interface.

Fruit-name uniqueness remains outside the aggregate boundary because determining uniqueness requires checking other Fruits. That rule is handled by the fruit-name uniqueness  domain service. 

## Alternatives

### Anemic Fruit data object

Fruit could contain only data, while controllers and application use cases implement storage and deletion rules. 

This was rejected because the rules could become duplicated over REST, GraphQL, and application operations.  It would also allow Fruit state to exists without protecting its invariants.

### Separate FruitDefinition and FruitInventory aggregates

Fruit information and stored inventory could be modeled separately.

This was rejected for the initial application because updating limits, storing inventory, removing inventory, and deciding whether deletion is permitted all depend closely on the same state. Separating them would introduce additional coordination without a demonstrated requirement.

## Consequences 

### Benefits

- Fruit-storage invariants are enforced in one place.
- REST and GraphQL use the same domain behavior.
- Domain behavior can be unit tested without NestJS and MongoDB.
- A repository loads and saves one complete Fruit aggregate.

### Costs and requirements

- All state changes must pass through Fruit operations.
- The Fruit aggregate may grow as additional fruit-storage behavior is introduced.
- Concurrent changes to the same Fruit may require persistence-level concurrency protection.
- Cross-Fruit rules, including name uniqueness, require a domain service and repository lookup.