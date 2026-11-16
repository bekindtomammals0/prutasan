## Context

The entry task requires every Fruit name to be unique, but it does not define whether names such lemon, Lemon, and LeMon identify as the same Fruit.

Treating these inputs as different names could create multiple records representing the same kind of fruit. A decision is required about how names are compared and how uniqueness is protected during concurrent requests.

## Decision

Fruit names will be trimmed and compared case-sensitively.

A FruitName value object will produce a normalized value used for lookup and uniqueness comparison. The original trimmed name may be retained for display, while the normalized value is used as the stable comparison value.

Before creating a Fruit, the fruit-name uniqueness domain service will use the FruitRepository interface to determine whether the normalized name already exists.

MongoDB will also enforce a unique index on the normalized name. The domain service provides an understandable business-level check, while the database index protects against concurrent requests that both pass the initial lookup.

A duplicate-key database error will be translated into the same application error returned by the domain uniqueness check.

## Considered alternatives

### Case-sensitive uniqueness

lemon and Lemon could be stored as separate Fruits.

This was rejected because capitalization does not represent a meaningful distinction between fruit types and could create confusing duplicates.

### Store only lowercase names

Every name could be permanently converted to lowercase.

This is simpler, but it was rejected because normalization for comparison does not require losing the preferred display form.

### Domain-service check without a database constraint

The domain service alone could check whether the name exists.

This was rejected because two concurrent creation requests could both observe that the name is available before either request saves its Fruit.

## Consequences

### Benefits

- Capitalization and surrounding whitespace cannot create duplicate Fruits.
- REST and GraphQL follow the same name-comparison rule.
- The domain service provides a clear business error before persistence when possible.
- The database protects uniqueness during concurrent requests.

### Costs and requirements

- Every name lookup must use the same normalization rule.
- Persistence must store or derive a normalized name consistently. 
- The Mongoose repository must translate duplicate-key errors into an application error. 
- Changing the normalization later may require migrating existing data and rebuilding the unique index.