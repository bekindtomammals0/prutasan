import { FruitId } from './fruit-id';

describe('FruitId', () => {
  it('compares identities by value', () => {
    expect(FruitId.create('fruit-123').equals(FruitId.create('fruit-123'))).toBe(true);
  });

  it('rejects an empty identity', () => {
    expect(() => FruitId.create('  ')).toThrow('Fruit ID cannot be empty');
  });
});
