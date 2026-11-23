import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import {
  DuplicateFruitNameError,
  FruitNameUniquenessService,
} from '../domain/fruit-name-uniqueness';
import { CreateFruit } from './create-fruit';

describe('CreateFruit', () => {
  it('checks the normalized name, saves the fruit, and returns it', async () => {
    const repository = new InMemoryFruitRepository();
    const createFruit = new CreateFruit(repository, new FruitNameUniquenessService(repository));

    const fruit = await createFruit.execute({
      name: '  Lemon  ',
      description: 'Sour',
      storageLimit: 10,
    });

    expect(fruit.name.displayName).toBe('Lemon');
    expect(fruit.name.normalizedName).toBe('lemon');
    expect(await repository.findByNormalizedName('lemon')).toEqual(
      expect.objectContaining({ id: fruit.id, name: fruit.name }),
    );
  });

  it('rejects a duplicate name without saving another fruit', async () => {
    const repository = new InMemoryFruitRepository();
    const createFruit = new CreateFruit(repository, new FruitNameUniquenessService(repository));
    await createFruit.execute({ name: 'Lemon', description: 'Sour', storageLimit: 10 });

    await expect(
      createFruit.execute({ name: ' lemon ', description: 'Yellow', storageLimit: 20 }),
    ).rejects.toThrow(DuplicateFruitNameError);
    expect(await repository.list()).toHaveLength(1);
  });
});
