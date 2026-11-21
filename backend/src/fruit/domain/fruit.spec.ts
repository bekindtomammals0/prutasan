import { Fruit } from './fruit';
import { FruitName } from './fruit-name';
import { FruitDescription } from './fruit-description';

describe('Fruit', () => {
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
    it('should update storage limit greater than or equal to stored amount', () => {
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
      expect(() => fruit.verifyDeletionAllowed(false)).toThrow('Fruit deletion is not allowed on non-emtpy storage');
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
  });
});
