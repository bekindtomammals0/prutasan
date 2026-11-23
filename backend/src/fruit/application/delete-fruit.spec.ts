import { Fruit } from '../domain/fruit';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { FruitDescription } from '../domain/fruit-description';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { DeleteFruit } from './delete-fruit';

describe('DeleteFruit', () => {
  it('checks the normalized name, deletes fruit without stored amount through the repository', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 0,
    });

    await repository.save(existing);

    const deleteFruit = new DeleteFruit(repository);

    const fruit = await deleteFruit.execute({
      name: 'apple',
      forceDelete: false,
    });

    expect(fruit.id.equals(existing.id)).toBe(true);
    expect(await repository.findByNormalizedName('apple')).toBeNull();
  });
  it('rejects deletion through repository if stored amount is not zero', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 2,
    });

    await repository.save(existing);

    const deleteFruit = new DeleteFruit(repository);

    await expect(
      deleteFruit.execute({
        name: 'apple',
        forceDelete: false,
      }),
    ).rejects.toThrow('Fruit deletion is not allowed on non-emtpy storage');
  });
  it('deletes through repository when stored amount is not zero if force delete is true', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 2,
    });

    await repository.save(existing);

    const deleteFruit = new DeleteFruit(repository);

    const fruit = await deleteFruit.execute({
      name: 'apple',
      forceDelete: true,
    });

    expect(fruit.id.equals(existing.id)).toBe(true);
    expect(await repository.findByNormalizedName('apple')).toBeNull();
  });
});
