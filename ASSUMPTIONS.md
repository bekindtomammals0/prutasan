# Domain Assumptions

## Fruit name uniqueness 
Assumptions: Names are compared as case-insensitive after trimming
Reason: The strings "Lemon", "lemon", and " LeMon " are the same and should not create three definitions for the same fruit.
Needs confirmation: Yes.

## Character limit
Assumptions: Character limit mentioned "30 letters", this is standardized to 30 characters including spaces in the count. 
Reason: Standard practice for database fields include storing whitespaces. Input validation length function also includes whitespace in the count.
Needs confirmation: No.

