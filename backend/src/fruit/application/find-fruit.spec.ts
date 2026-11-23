import { Fruit } from '../domain/fruit';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { FruitDescription } from '../domain/fruit-description';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { FindFruit } from './find-fruit';

describe('FindFruit', () => {
  it('returns existing fruit through repository', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 0,
    });

    await repository.save(existing);

    const findFruit = new FindFruit(repository);

    const fruit = await findFruit.execute({
      name: 'apple',
    });

    expect(fruit.name.equals(FruitName.create('apple'))).toBe(true);
    expect(fruit.id.equals(existing.id)).toBe(true);
  });
  it('raises fruit not found', async () => {
    const repository = new InMemoryFruitRepository();
    const findFruit = new FindFruit(repository);
    await expect(
      findFruit.execute({
        name: 'apple',
      }),
    ).rejects.toThrow('Fruit "apple" not found');
  });
  it('raises fruit not found after fruit deletion', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 0,
    });

    await repository.save(existing);

    const findFruit = new FindFruit(repository);

    const fruit = await findFruit.execute({
      name: 'apple',
    });

    expect(fruit.name.equals(FruitName.create('apple'))).toBe(true);
    expect(fruit.id.equals(existing.id)).toBe(true);

    await repository.delete(existing);

    expect(await repository.findByNormalizedName('apple')).toBeNull();
  });
});
