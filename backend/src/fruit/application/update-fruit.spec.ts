import { Fruit } from '../domain/fruit';
import { FruitDescription } from '../domain/fruit-description';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { UpdateFruit } from './update-fruit';

describe('UpdateFruit', () => {
  it('checks the normalized name, locate the fruit, validates optional description and limit updates', async () => {
    const repository = new InMemoryFruitRepository();

    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });

    await repository.save(existing);

    const updateFruit = new UpdateFruit(repository);

    const fruit = await updateFruit.execute({
      name: 'apple',
      limit: 5,
    });

    expect(fruit.name.normalizedName).toBe('apple');
    expect(fruit.description.value).toBe('A sweet fruit');
    expect(fruit.storageLimit).toBe(5);
  });
  it('rejects neither description nor limit provided', async () => {
    const repository = new InMemoryFruitRepository();
    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });

    await repository.save(existing);

    const updateFruit = new UpdateFruit(repository);

    await expect(
      updateFruit.execute({
        name: 'apple',
      }),
    ).rejects.toThrow('Update cannot be performed without any changes to be made');
  });
});
