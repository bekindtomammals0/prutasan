# Fruit Storage Domain

## Purpose

Establish a common language for Fruit Storage between domain expert and developer.

## Glossary

| **Term** | **Definition** |
| :------------------ | :----------------------------------------- |
| *Fruit*             | A type of fruit managed by the storage system. |
| *Create fruit*      | Creating the definition of a fruit that the system can store.|
| *Fruit description* | Description of the fruit that the system stores. |
| *Stored amount*     | The current quantity of fruit in storage. |
| *Storage limit*     | Maximum stored amount allowed for fruit. |
| *Store fruit*       | Increase stored amount of fruit without exceeding limit. |
| *Remove fruit*      | Decrease the stored amount without going below zero. |
| *Delete fruit*      | Deletes the fruit storage if stored amount is zero, unless force deleted. |
| *Force delete*      | Deletes fruit storage even with remaining inventory. |
| *Update fruit*      | Change fruit description and fruit storage limit, as long as limit is above stored amount. |
| *Fruit list*        | Returns list of all fruits available. |
| *Find fruit*        | Return fruit object from list. |
| *Domain event*      | Record of meaningful domain changes that occurred. |

## Domain Invariants

- Fruit name must be unique.
- Fruit description cannot exceed 30 characters
- Stored amount is never negative.
- Storage limit is never negative.
- Stored amount never exceeds storage limit.
- Storage and removal amounts are positive integers .
- Deleting non-empty fruit storage is not allowed unless force deleted.

## Aggregate Model

Fruit is the aggregate root.
It owns: 
- Fruit Name
- Fruit Description
- Storage Limit
- Stored Amount

All changes to these values occur through Fruit operations.

## Domain Events

- FruitCreated
- FruitUpdated
- FruitDeleted

## Open Questions

- Are names compared case-insensitively?
- Does amount represent individual pieces?
- Can Storage Limit be reduced below Stored Amount?
- Does force deletion represent discarding the remaining inventory?
- Can Fruit Name be changed?
