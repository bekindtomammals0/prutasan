# Fruit Storage Use Cases
## Purpose

This document defines the application behavior of the fruit storage system independently of any user interface, API protocol, framework, or database.

## Use case #1 -  Create Fruit:

### Command/mutation: 

`createFruitForFruitStorage(name: string, description: string, limitOfFruitToBeStored: int)`

### Goal

Create a new type of fruit that can be held by the storage system.

### Input:

- name
- description
- storage limit

### Preconditions 

- No fruit with the same normalized name exists.
- The name is valid.
- The description is valid.
- The storage limit is valid.

### Success Flow

1. Normalize and validate the fruit name.
2. Verify that the normalized name is not already in use.
3. Validate the description.
4. Validate the storage limit.
5. Create the fruit with a stored amount of zero.
6. Record that the fruit was created.
7. Save the new fruit.

### Failure Conditions

- The name is empty.
- A fruit with the same normalized name already exists.
- The description exceeds 30 characters.
- The storage limit is not a non-negative integer.

### Outcome

- Returns: the created fruit.
- State change: a new fruit exists with a stored amount of zero.
- Domain event: `FruitCreated`.

## Use case #2 - Update Fruit:

### Command/mutation: 

`updateFruitForFruitStorage(name: string, description: string, limitOfFruitToBeStored: int)`

### Goal

Change the description and storage limit of an existing fruit.
The supplied name identifies the existing fruit. This operation does not rename it.

### Input:

- existing fruit name
- new description
- new storage limit

### Preconditions

- A fruit with the supplied normalized name exists.
- The new description is valid.
- The new storage limit is valid.
- The new storage limit is not lower than the currently stored amount.

### Success Flow

1. Normalize and validate the supplied name.
2. Find the existing fruit by its normalized name.
3. Validate the new description.
4. Validate the new storage limit.
5. Ask the fruit to update its description and storage limit.
6. Record that the fruit was updated.
7. Save the updated fruit.

### Failure Conditions

- No fruit with the supplied normalized name exists.
- The description exceeds 30 characters.
- The storage limit is not a non-negative integer.
- The new storage limit is lower than the currently stored amount.

### Outcome

- Returns: the updated fruit.
- State change: the fruit has the new description and storage limit.
- Domain event: `FruitUpdated`.

## Use case #3 - Delete Fruit:

### Command/mutation: 

`deleteFruitFromFruitStorage(name: string, forceDelete: boolean)`
### Goal

Delete an existing fruit definition from the storage system.
A fruit containing stored inventory can only be deleted when forced deletion is explicitly requested.

### Input:

- existing fruit name
- force delete indicator

### Preconditions

- A fruit with the supplied normalized name exists.
- The force-delete indicator is a boolean.
- If the fruit has stored inventory, force deletion is enabled/true.

### Success Flow

1. Normalize and validate the supplied name.
2. Find the existing fruit by its normalized name.
3. Ask the fruit whether deletion is allowed.
4. If inventory remains, verify that force deletion is enabled/true.
5. Record that the fruit will be deleted.
6. Delete the fruit.

### Failure Conditions

- No fruit with the supplied normalized name exists.
- The force-delete indicator is not a boolean.
- The fruit has a stored amount greater than zero and force deletion is disabled.

### Outcome

- Returns: confirmation that the fruit was deleted.
- State change: the fruit definition no longer exists.
- If deletion was forced, any remaining stored inventory is discarded with the fruit definition. 
- Domain event: `FruitDeleted`.

## Use case #4 - Store Fruit:

### Command/mutation: 

`storeFruitToFruitStorage(name: string, amount: int)`

### Goal

Store fruit into existing fruit storage.

### Inputs:

- existing fruit name
- amount to store

### Preconditions

- A fruit with supplied normalized name exists.
- The amount is a positive integer.
- Adding the amount will no exceed storage limit.

### Success Flow

1. Normalize and validate the supplied name.
2. Find the existing fruit using the supplied name
3. Validate the amount.
4. Ask the fruit to store the requested amount.
5. Record that fruit was stored.
6. Save the updated fruit.

### Failure Conditions

- No fruit with the normalized name exists.
- The amount is zero.
- The amount is negative.
- The amount is not an integer.
- The resulting amount would exceed storage limit.

### Outcome

- Returns: the updated fruit.
- State change: the stored amount increases by the requested amount.
- Domain event:`FruitStored`

## Use case #5 - Remove Fruit:

### Command/mutation: 

`removeFruitFromFruitStorage(name: string, amount: int)`

### Goal

Remove amount of fruit from storage.

### Inputs:

- existing fruit name
- amount to remove

### Preconditions

- A fruit with supplied normalized name exists.
- The amount is a positive integer.
- The requested amount is not greater than currently stored amount.

### Success Flow

1. Normalize and validate the supplied name.
2. Find the existing fruit using the supplied name
3. Validate the amount.
4. Ask the fruit to remove the requested amount.
5. Record that fruit was removed from storage.
6. Save the updated fruit.

### Failure Conditions

- No fruit with the normalized name exists.
- The amount is zero.
- The amount is negative.
- The amount is not an integer.
- The requested amount exceeds stored amount.

### Outcome

- Returns: the updated fruit.
- State change: the stored amount decreases by requested amount.
- Domain event: `FruitRemoved`

## Use Case #6 - Find Fruit from list

### Query: 

`findFruit(name: string)`

### Goal

Retrieve one existing fruit using its name.

### Inputs:

- Fruit name

### Preconditions

- The supplied name is valid.

### Success Flow

1. Normalize and validate the supplied name.
2. Find the existing fruit by its normalized name.
3. Return the fruit.

### Failure Conditions

- The name is empty.
- No fruit with the normalized name exists.

### Outcome

- Returns: the matching fruit.
- State change: none.
- Domain event: none.

## Use case #7 - Retrieve list of fruits stored

### Query: 

`listFruits()`

### Goal

Retrieve list of existing fruits.

### Inputs:

- None

### Preconditions

- None

### Success Flow

1. Retrieve all existing fruits.
2. Return the fruits.

### Failure Conditions

- None

### Outcome

- Returns: all fruits.
- Returns an empty collections if no fruit exists.
- State change: none.
- Domain event: none.