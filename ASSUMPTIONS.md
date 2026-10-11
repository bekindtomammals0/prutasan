# Domain Assumptions

## Fruit name uniqueness 
Assumptions: Names are compared as case-insensitive after trimming
Reason: The strings "Lemon", "lemon", and " LeMon " are the same and should not create three definitions for the same fruit.
Needs confirmation: Yes.

## Character limit
Assumptions: Character limit mentioned "30 letters", this is standardized to 30 characters including spaces in the count. 
Reason: Standard practice for database fields include storing whitespaces. Input validation length function also includes whitespace in the count.
Needs confirmation: No.

## Zeros or negative storage amounts
Assumptions: Fruit cannot be created with negative amount. Zero or more capacity is allowed on initation.
Reason: Creating the fruit for fruit storage can start as zero capacity, but amount removed and added from the fruit storage should always be greater than zero if capacity permits, never negative.
Needs confirmation: Yes.

## Reducing storage limit less than quantity stored
Assumption: Updating the storage limit to be less than the quantity stored will reject update request.
Reason: Removing the excess amount from the fruit storage should come first before updating storage limit.
Needs confirmation: Yes.

## Force-deletion soft-deletes fruit data
Assumption: Force deleting stored fruit definition and amount will soft-delete the entire fruit data.
Reason: This retains historical data, allowing retrieval of mistaken deletes. Purely destructive actions will be harder for the user to work around the application safely.
Needs confirmation: Yes.

## Domain events
Assumption: Pending outbox domain events are delivered to an internal application event bus through a transactional outbox publisher (audit handler).
Reason:  The assignment requires at-least-once delivery but does not specify an
external receiver or message broker. An external broker could be overkill for this small exercise unless specified, but the event bus is abstracted for ease of external broker replacement.
Needs confirmation: Yes.