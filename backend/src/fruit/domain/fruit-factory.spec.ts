import { FruitFactory } from './fruit-factory';
import { FruitId } from './fruit-id';

describe('FruitFactory', () => {
  it('creates a valid Fruit with no stored inventory', () => {
    const fruit = FruitFactory.create({
      id: FruitId.create('fruit-123'),
      name: '  Pink Lady Apple  ',
      description: '  Crisp and sweet  ',
      storageLimit: 20,
    });

    expect(fruit.id.value).toBe('fruit-123');
    expect(fruit.name.displayName).toBe('Pink Lady Apple');
    expect(fruit.name.normalizedName).toBe('pink lady apple');
    expect(fruit.description.value).toBe('Crisp and sweet');
    expect(fruit.storageLimit).toBe(20);
    expect(fruit.storedAmount).toBe(0);
  });

  it.each([
    { name: '', description: 'A fruit', storageLimit: 10 },
    { name: 'Apple', description: '', storageLimit: 10 },
    { name: 'Apple', description: 'A fruit', storageLimit: -1 },
    { name: 'Apple', description: 'A fruit', storageLimit: 1.5 },
  ])('prevents construction from invalid input: %o', (input) => {
    expect(() => FruitFactory.create(input)).toThrow();
  });

  it('keeps identity separate from display and normalized names', () => {
    const fruit = FruitFactory.create({
      id: FruitId.create('fruit-123'),
      name: '  Apple  ',
      description: 'A fruit',
      storageLimit: 10,
    });

    expect(fruit.id.value).toBe('fruit-123');
    expect(fruit.name.displayName).toBe('Apple');
    expect(fruit.name.normalizedName).toBe('apple');
    expect(fruit.id.value).not.toBe(fruit.name.normalizedName);
  });

  it('records exactly one FruitCreated event', () => {
    const fruit = FruitFactory.create({
      id: FruitId.create('fruit-123'),
      name: 'Apple',
      description: 'A fruit',
      storageLimit: 10,
    });

    expect(fruit.pullDomainEvents()).toEqual([
      expect.objectContaining({
        eventType: 'FruitCreated',
        aggregateId: 'fruit-123',
        payload: {
          name: fruit.name,
        },
      }),
    ]);
  });

  it('generates an identity when one is not supplied', () => {
    const fruit = FruitFactory.create({
      name: 'Apple',
      description: 'A fruit',
      storageLimit: 10,
    });

    expect(fruit.id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
