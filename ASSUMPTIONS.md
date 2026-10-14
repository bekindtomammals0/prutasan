## Purpose

This document records the developer's assumptions according to app requirements. Some assumptions require confirmation before proceeding to next stage of software development.

## Fruit name uniqueness 

### Assumptions: 

Names are compared as case-insensitive after trimming
### Reason: 

The strings "Lemon", "lemon", and " LeMon " are the same and should not create three definitions for the same fruit.

### Needs confirmation: 

Yes.

## Character limit

### Assumptions: 

Character limit mentioned "30 letters", this is standardized to 30 characters including spaces in the count. 

### Reason: 

Standard practice for database fields include storing whitespaces. Input validation length function also includes whitespace in its count.

### Needs confirmation: 

No.

## Zeros or negative storage limit

### Assumptions: 

Fruit cannot be created with negative storage limit. Zero or more storage limit is allowed on initialization.

### Reason: 

Creating the fruit can start at zero storage limit, but amount removed and added from the fruit storage should always be greater than zero if storage limit permits, never negative.

### Needs confirmation: 

Yes.

## Reducing storage limit less than stored amount

### Assumption: 

Updating the storage limit to be less than the quantity stored will reject update request.

### Reason: 

Removing the excess amount from the fruit storage should come first before updating storage 
limit.

### Needs confirmation: 

Yes.

## Force-deletion soft-deletes fruit data

### Assumption: 

Force deleting stored fruit definition and amount will soft-delete the entire fruit data.

### Reason: 

This retains historical data, allowing retrieval of mistaken deletes. Purely destructive actions will be harder for the user to work around the application safely.

### Needs confirmation: 

Yes.

## Domain events

### Assumption: 

Pending outbox domain events are delivered to an internal application event bus through a transactional outbox publisher (audit handler).

### Reason:  

The assignment requires at-least-once delivery but does not specify an external receiver or message broker. An external broker could be overkill for this small exercise unless specified, but the event bus is abstracted for ease of external broker replacement.

### Needs confirmation: 

Yes.

## Frontend behavior

### Assumptions: 

The frontend is a minimal single-page interface for listing, creating,
updating, deleting, storing, and removing fruits.

### Reason: 

No detailed frontend acceptance criteria are provided. The frontend should therefore be a thin interface demonstrating the backend domain behavior.

### Needs confirmation: 

No.

## RESTfulness

### Assumptions: 

The REST API initially exposes conventional CRUD operations for the Fruit resource. Store and remove are domain commands rather than CRUD operations, so they are exposed through GraphQL only unless API consistency is required.

### Reason: 

The initial REST interface is limited to CRUD because that is the scope explicitly stated in the test. Store and remove are business commands rather than direct field updates, but REST can expose them through dedicated command endpoints if feature consistency is expected. Both GraphQL and REST would call the same application use cases.

### Needs confirmation: 

Yes.