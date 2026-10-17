# Fruit Storage Acceptance Tests

Read https://khalilstemmler.com/articles/test-driven-development/introduction-to-tdd/ then
Read https://khalilstemmler.com/articles/high-value-typical-tests/ before tests were written.

## Purpose

Define the acceptance tests manually according to [[Entry Task]]. Focus more on valuable outcomes (customer-focused, but in this scenario 'end-user' is more appropriate because it is an entry task). Converted to Given-When-Then language for transferable syntax and understanding.

## Tests

### Command `**createFruitForFruitStorage**`

#### CREATE-01: Create a valid fruit

##### Scenario:  Create a fruit with valid properties

Given no fruit with name "lemon" exists
When a fruit is created with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 10
Then a fruit named "lemon" exists
And its description contains "this is a lemon"
And its storage limit is 10
And its stored amount is 0
And a FruitCreated domain event is recorded

#### CREATE-02: Reject long description

##### Scenario: Reject fruit creation if the description exceeds 30 characters in lenght

Given no fruit named "lemon" exists
When a fruit is created with:
- name = "lemon"
- description = "fruit with a very long description"
- limitOfFruitToBeStore = 10
Then the fruit creation fails with a fruit description length validation error
And no fruit named "lemon" is created
And no FruitCreated domain event is recorded

#### CREATE-03: Reject duplicate name

##### Scenario: Reject creation of duplicated fruit name

Given a fruit named "lemon" already exists
When another fruit named "lemon" is created
Then the creation fails with a duplicate-name error
And no duplicated fruit named "lemon" exists
And no additional FruitCreated domain event is recorded

### Command `**updateFruitForFruitStorage**`

#### UPDATE-01:  Valid description update

##### Scenario: Update an existing fruit with valid description

Given a fruit exists with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 0
When updateFruitForFruitStorage is called with:
- name = "lemon"
- description = "updated lemon description"
- limitOfFruitToBeStored = 10
Then the update succeeds
And its description becomes "updated lemon description"
And its storage limit remains 10
And its stored amount remains 0
And a FruitUpdated domain event is recorded

#### UPDATE-02: Description is too long

##### Scenario: Reject update of fruit description if new description exceeds 30 characters

Given a fruit exists with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 0
When updateFruitForFruitStorage is called with:
- name = "lemon"
- description = "updated lemon description with a long description"
- limitOfFruitToBeStored = 10
Then the update fails with a description-length validation error
And the fruit named "lemon" still has the description "this is a lemon"
And its storage limit remains 10
And its stored amount remains 0
And no FruitUpdated domain event is recorded

### Additional tests for `**updateFruitForFruitStorage**`

#### UPDATE-A01:  Omitted limit is preserved

##### Scenario: Preserve the current storage limit when it is omitted

Given a fruit exists with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 0
When its description is updated with "updated lemon description"
And limitOfFruitToBeStored is omitted
Then the update succeeds
And its description becomes "updated lemon description"
And its storage limit remains 10
And a FruitUpdated domain event is recorded

#### UPDATE-A02: Explicit limit is changed

##### Scenario: Update the storage limit if a new limit is provided

Given a fruit exists with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 5
When updateFruitForFruitStorage is called with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 15
Then the update succeeds
And its description remains "this is a lemon"
And its storage limit becomes 15
And its stored amount remains 5
And a FruitUpdated domain event is recorded

#### UPDATE-A03: Limit equals existing inventory

##### Scenario: Allow the storage limit to equal the currently stored amount

Given a fruit exists with:
- name = "lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 5
When its storage limit is updated to 5
Then the update succeeds
And its storage limit becomes 5
And its stored amount remains 5
And a FruitUpdated domain event is recorded

#### UPDATE-A04: Limit below existing inventory

##### Scenario: Reject update to storage limit below current stored amount

Given a fruit exists with:
- name = "lemon"
- limitOfFruitToBeStored = 10
- storedAmount = 5
When its storage limit is updated to 4
Then the update fails with storage-limit validation error
And its storage limit remains 10 
And its stored amount remains 5
And no FruitUpdated domain event is recorded

#### UPDATE-A05: Missing fruit

##### Scenario: Reject updating a fruit that does not exist

Given no fruit named "lemon" exists
When updateFruitForFruitStorage is called with:
- name = "lemon"
- description = "this is a lemon"
- limitOfFruitToBeStored = 15
Then update fails with a FruitNotFound error
And no fruit "lemon" is created
And no FruitUpdated domain event is recorded

#### UPDATE-A06: Explicit null limit

##### Scenario: Reject fruit update with explicitly null storage limit

Given a fruit named "lemon" exists with storage limit 10
When its description is updated
And limitOfFruitToBeStored is explicitly null
Then the updated fails with an invalid-storage-limit error
And the fruit remains unchanged
And no FruitUpdated domain event is recorded

#### UPDATE-A07: Empty update

##### Scenario: Reject fruit update with no mutable fields

Given a fruit named "lemon"
When updateFruitForFruitStorage is called with only its name
And both description and limitOfFruitToBeStored are omitted
Then the update fails with empty-update error
And the fruit remains unchanged
And no FruitUpdated domain event is recorded

### Command `**deleteFruitFromFruitStorage**`

#### DELETE-01: Reject deletion of non-empty fruit storage

##### Scenario: Refuse to delete a fruit with stored amount > 0

Given a fruit named "lemon" exists 
And its stored amount is 5
When deleteFruitFromFruitStorage is called and forceDelete is false
Then the deletion fails with fruit-non-empty error
And the fruit "lemon" still exists
And no FruitDeleted domain event is recorded

#### DELETE-02: Force deletion

##### Scenario: Force delete a fruit with a stored amount > 0 if force delete is true

Given a fruit named "lemon" exists 
And its stored amount is 5
When deleteFruitFromFruitStorage is called and forceDelete is true
And the fruit "lemon" no longer exists
And a FruitDeleted domain event is recorded

### Additional tests `**deleteFruitFromFruitStorage**`

(TBD)

### Command `**storeFruitToFruitStorage**`

#### STORE-01: Store without exceeding limit

##### Scenario: Store fruit while remaining within storage limit

Given fruit named "lemon" exists
And its storage limit is 10
And its current stored amount is 0
When 5 lemons are stored
Then the operation succeeds
And the stored amount becomes 5
And a FruitStored domain event is recorded

#### STORE-02:  Reject storage exceeding limit

##### Scenario: Reject storing fruit above its storage limit

Given fruit named "lemon" exists
And its storage limit is 10
And its current stored amount is 0
When 11 lemons are stored
Then the operation fails with exceed-storage-limit error
And the stored amount remains 0
And no FruitStored domain event is recorded

### Additional tests `**storeFruitToFruitStorage**`

(TBD)

### Command `**removeFruitFromFruitStorage**`

#### REMOVE-01: Remove valid amount from storage

##### Scenario: Remove value of fruits if less than stored amount

Given fruit named "lemon" exists
And its storage limit is 10
And its current stored amount is 5
When 5 lemons are removed
Then the operation succeeds
And the stored amount becomes 0
And a FruitRemoved domain event is recorded

#### REMOVE-02: Reject removal exceeding storage amount

##### Scenario: Reject removing value greater than stored amount

Given fruit named "lemon" exists
And its storage limit is 10
And its current stored amount is 5
When 6 lemons are removed
Then the operation fails with exceed-stored-amount error
And the stored amount becomes 5
And no FruitRemoved domain event is recorded

### Additional tests `**removeFruitFromFruitStorage**`

(TBD)

### Query `**findFruit**`

#### FIND-01: Fruit exists

##### Scenario: Fruit requested exists

Given fruit named "lemon" exists
When a fruit named "lemon" is requested
Then the fruit object is returned

#### FIND-02: Fruit not found

##### Scenario: Fruit does not exist from list

Given no fruit named "not a lemon" exists
When a fruit named "not a lemon" is requested
Then the operation fails with a FruitNotFound error
And no fruit object is returned