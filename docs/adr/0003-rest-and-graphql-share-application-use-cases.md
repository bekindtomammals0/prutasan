## Context

The application must provide REST CRUD operations and GraphQL queries and mutations.

If REST controllers and GraphQL resolvers implement their own workflow, fruit-storage rules and persistence coordination could be duplicated. The two interfaces could then return inconsistent behavior for the same operation.

A decision is required about where shared application behavior resides.

## Decision

REST controllers and GraphQL resolvers will act as presentation adapters. They will translate transport-specific input into requests for shared application use cases.

Operations representing the same user intention will call the same use case:
- REST create and GraphQL `createFruitForFruitStorage`call `CreateFruit`;
- REST update and GraphQL `updateFruitForFruitStorage` call `UpdateFruit`;
- REST delete and GraphQL `deleteFruitFromFruitStorage` call `DeleteFruit`;
- REST store and GraphQL `storeFruitToFruitStorage` call `StoreFruit`;
- REST remove and GraphQL `removeFruitFromFruitStorage` call `RemoveFruit`;
- REST find and GraphQL `findFruit` call `FindFruit`; and 
- REST list and GraphQL `listFruits` call `ListFruits`.

Presentation adapters may validate transport and translate errors, but they must not implement Fruit invariants or access Mongoose directly.

## Considered alternatives

### Separate REST and GraphQL implementations

Each interface could have its own workflow and persistence logic.

This was rejected because business behavior and failure handling could diverge between interfaces.

### REST calls the GraphQL interfaces

REST controllers could translate requests into internal GraphQL operations.

This was rejected because it would make one presentation adapter depend on another and would add unnecessary translation. Both adapters should depend directly on the application layer.

### GraphQL calls REST endpoints

GraphQL resolvers could make internal HTTP requests to REST endpoints.

This was rejected for the same reason: transport mechanisms should not coordinate domain behavior.

## Consequences

### Benefits

- Business behavior is implemented once.
- REST and GraphQL produce consistent state changes.
- Application use cases can be tested without either transport.
- A presentation interface can change without rewriting domain behavior.
- Mongoose access remains outside controllers and resolvers.

### Costs and requirements

- Each presentation adapter still requires input and output mapping.
- REST and GraphQL may represent the same application error differently.
- Transport-level validation must not be mistaken for domain validation.
- End-to-end tests are still required for both interfaces.