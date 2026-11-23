import { Fruit } from '../domain/fruit';
import { FruitDescription } from '../domain/fruit-description';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { StoreFruit } from './store-fruit';

describe('StoreFruit', () => {
  it('checks the normalized name, locate the fruit, validates allowed stored amount, saves, and returns the fruit', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });
    await repository.save(existing);

    const storeFruit = new StoreFruit(repository);
    const fruit = await storeFruit.execute({
      name: 'apple',
      amount: 5,
    });

    expect(fruit.id.equals(existing.id)).toBe(true);
    expect(fruit.storedAmount).toBe(10);

    const savedFruit = await repository.findByNormalizedName('apple');
    expect(savedFruit?.storedAmount).toBe(10);
  });
  it('rejects invalid stored amount without updating fruit contents (storedAmount, description, limit', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });

    await repository.save(existing);

    const storeFruit = new StoreFruit(repository);
    const input = {
      name: ' apple ',
      amount: 10,
    };

    await expect(storeFruit.execute(input)).rejects.toThrow('Storage limit exceeded');

    const savedFruit = await repository.findByNormalizedName('apple');
    expect(savedFruit).not.toBeNull();
    expect(savedFruit?.storedAmount).toBe(5);
    expect(savedFruit?.description.value).toBe('A sweet fruit');
    expect(savedFruit?.storageLimit).toBe(10);
    // expect(fruit.id.equals(existing.id)).toBe(true);
  });
});
