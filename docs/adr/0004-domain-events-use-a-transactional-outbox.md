## Context

Creating, updating, deleting, storing, and removing a Fruit must produce domain events with at-least-once delivery.

Publishing an event directly before saving the Fruit could announce a change that later fails. Publishing after saving could lose the event if the Fruit is committed but publication fails or the application stops.

A decision is required about how Fruit state and required event records remain consistent while still permitting publication retries. 

## Decision

Fruit changes and their domain events will be persisted using the transactional outbox pattern. 

During a write use case:
- the domain records the applicable event;
- the Mongoose repository begins a MongoDB transaction;
- the changed Fruit is persisted;
- pending outbox records are persisted in the same transaction; and
- the transaction commits both changes together.

A scheduled outbox publisher will periodically claim pending records, publish them through an outbox-publisher interface, and mark successful records as delivered.

Failed publications will remain eligible for retry. Every event will have a stable event ID. Because delivery is at least once, consumers must tolerate receiving the same event more than once.

The required events are:
- `FruitCreated`;
- `FruitUpdated`;
- `FruitDeleted`;
- `FruitStored`; and
- `FruitRemoved`.

The eventual publication destination remains replaceable behind the event-publisher interface. An external broker is not required for the baseline implementation.

## Considered alternatives

### Publish directly after saving

The application could save the Fruit and then immediately publish its event.

This was rejected because the Fruit could be committed while event publication fails, causing the event to be lost.

### Publish before saving

The application could publish first and then save the Fruit.

This was rejected because consumers could receive an event describing a state change that never commits.

### In-memory event queue

Events could remain in application memory until published.

This was rejected because pending events would be lost when the application stops or crashes.

### Change-data capture

A database change stream could detect Fruit changes and detect events.

This was not selected for the initial implementation because it adds operational complexity and makes explicitly recorded domain intent less visible.

### 



## Consequences

### Benefits

- A committed Fruit change has a corresponding durable outbox record.
- Temporary publication failures can be retried. 
- Event publication technology remains replaceable.
- The system satisfies at-least-once delivery without coupling the domain to node-cron or a particular message transport.

### Costs and requirements

- MongoDB must run in a configuration that supports transactions, normally a replica set.
- The application must monitor pending and repeatedly failing outbox records.
- More than one publisher must not process the same pending record concurrently without coordination.
- Publication may succeed even if marking the record delivered fails, causing duplicate delivery.
- Event consumers must therefore be idempotent.
- Delivered records require a retention or cleanup policy.
- Integration tests must verify that Fruit state and outbox records commit or roll back together. 