import { Fruit } from './fruit';
import { FruitName } from './fruit-name';
import { FruitDescription } from './fruit-description';

describe('Fruit', () => {
  describe('createNew', () => {
    it('creates a valid fruit and records FruitCreated', () => {
      const name = FruitName.create('Apple');
      const description = FruitDescription.create('A sweet fruit');

      const fruit = Fruit.createNew({
        id:'1',
        name,
        description,
        storageLimit: 10,
      });

      expect(fruit.id).toBe('1');
      expect(fruit.name.equals(name)).toBe(true);
      expect(fruit.description.equals(description)).toBe(true);
      expect(fruit.storageLimit).toBe(10);
      expect(fruit.storedAmount).toBe(0);

      expect(fruit.pullDomainEvents()).toEqual([
        expect.objectContaining({
          eventType: 'FruitCreated',
          aggregateId: '1',
          payload: {
            name,
          },
        }),
      ]);
    });
    it('does not record FruitCreated when reconstituting an existing fruit', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(fruit.pullDomainEvents()).toHaveLength(0);
    });
  });
  describe('store', () => {
    it('should store fruit if storage limit is not exceeded', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.store(5);
      expect(fruit.storedAmount).toBe(10);
    });
    it('should throw an error if storage limit is exceeded', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.store(6)).toThrow('Storage limit exceeded');
      expect(fruit.storedAmount).toBe(5);
    });
    it('should reject 0 or less store amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.store(0)).toThrow('Store amount must be greater than 0');
      expect(() => fruit.store(-1)).toThrow('Store amount must be greater than 0');
      expect(fruit.storedAmount).toBe(5);
      expect(fruit.description.equals(FruitDescription.create('A sweet fruit'))).toBe(true);
    });
    it('should reject non-integer stored amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.store(1.5)).toThrow('Store amount must be an integer');
      expect(fruit.storedAmount).toBe(5);
    });
    it('should record FruitStored if storing is allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.store(5);
      expect(fruit.pullDomainEvents()).toEqual([
        expect.objectContaining({
          eventType: 'FruitStored',
          aggregateId: fruit.id,
          payload: {
            amount: 5,
            storedAmount: 10,
          },
        }),
      ]);
    });
    it('should not record FruitStored if storing is not allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.store(6)).toThrow();
      expect(fruit.pullDomainEvents()).toHaveLength(0);
    });
  });
  describe('remove', () => {
    it('should remove fruit if stored amount is sufficient', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.remove(5);
      expect(fruit.storedAmount).toBe(0);
    });
    it('should reject if amount to remove is greater than stored amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.remove(6)).toThrow('Remove amount should be less than stored amount');
      expect(fruit.storedAmount).toBe(5);
    });
    it('should reject 0 or less remove amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.remove(0)).toThrow('Remove amount should be greater than 0');
      expect(() => fruit.remove(-1)).toThrow('Remove amount should be greater than 0');
      expect(fruit.storedAmount).toBe(5);
    });
    it('should reject non-integer remove amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.remove(1.5)).toThrow('Remove amount must be an integer');
      expect(fruit.storedAmount).toBe(5);
    });
    it('should record FruitRemoved if removing is allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.remove(5);
      // expect(fruit.storedAmount).toBe(0);
      expect(fruit.pullDomainEvents()).toEqual([
        expect.objectContaining({
          eventType: 'FruitRemoved',
          aggregateId: fruit.id,
          payload: {
            amount: 5,
            storedAmount: 0,
          },
        }),
      ]);
    });
    it('should not record FruitRemoved if removing is not allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      // fruit.remove(6);
      expect(() => fruit.remove(6)).toThrow();
      expect(fruit.pullDomainEvents()).toHaveLength(0);
    });
  });
  describe('update', () => {
    it('should update fruit with valid parameters', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 5,
        storedAmount: 5,
      });
      fruit.update(FruitDescription.create('Sweeter now than ever'), 10);
      expect(fruit.description.equals(FruitDescription.create('Sweeter now than ever'))).toBe(true);
      expect(fruit.storageLimit).toBe(10);
    });
    it('should reject description that is too long', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 5,
        storedAmount: 5,
      });
      expect(() => {
        fruit.update(
          FruitDescription.create('This description is definitely longer than thirty characters.'),
          10,
        );
      }).toThrow('Description must be 30 characters or less');
    });
    it('should reject negative limit update', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 5,
        storedAmount: 5,
      });
      expect(() => {
        fruit.update(FruitDescription.create('A sweet fruit'), -1);
      }).toThrow('Storage limit should always be greater than 0');
    });
    it('should reject storage limit less than stored amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 5,
        storedAmount: 5,
      });
      expect(() => {
        fruit.update(FruitDescription.create('A sweet fruit'), 4);
      }).toThrow('Storage limit should be greater than or equal to stored amount');
    });
    it('should allow updating storage limit to greater than or equal to stored amount', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.update(FruitDescription.create('A sweet fruit'), 5);
      expect(fruit.storageLimit).toBe(5);
    });
    it('records FruitUpdated when updating storage limit is allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      fruit.update(FruitDescription.create('A sweet fruit'), 5);
      expect(fruit.storageLimit).toBe(5);
      expect(fruit.pullDomainEvents()).toEqual([
        expect.objectContaining({
          eventType: 'FruitUpdated',
          aggregateId: fruit.id,
          payload: {
            description: FruitDescription.create('A sweet fruit'),
            storageLimit: 5,
          },
        }),
      ]);
    });
    it('it does not record FruitUpdated when updating storage limit is not allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.update(FruitDescription.create('A sweet fruit'), 4)).toThrow();
      expect(fruit.pullDomainEvents()).toHaveLength(0);
    });
  });
  describe('delete', () => {
    it('should allow deletion of empty fruit without forcing', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 0,
      });
      expect(() => fruit.verifyDeletionAllowed(false)).not.toThrow();
    });
    it('should reject deletion of non-empty fruit', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 1,
      });
      expect(() => fruit.verifyDeletionAllowed(false)).toThrow(
        'Fruit deletion is not allowed on non-emtpy storage',
      );
    });
    it('should allow deletion of non-empty fruit if forceDeletion is true', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 1,
      });
      expect(() => fruit.verifyDeletionAllowed(true)).not.toThrow();
    });
    it('records FruitDeleted when delete is allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 1,
      });
      fruit.verifyDeletionAllowed(true);
      expect(fruit.pullDomainEvents()).toEqual([
        expect.objectContaining({
          eventType: 'FruitDeleted',
          aggregateId: fruit.id,
          payload: expect.objectContaining({
            discardedAmount: 1,
          }),
        }),
      ]);
    });
    it('does not record FruitDeleted when delete is not allowed', () => {
      const fruit = Fruit.reconstitute({
        id: '1',
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      expect(() => fruit.verifyDeletionAllowed(false)).toThrow();
      expect(fruit.pullDomainEvents()).toHaveLength(0);
    });
  });
});
