import { FruitRepository } from '../domain/fruit-repository';
import { FruitFactory } from '../domain/fruit-factory';
import { FruitId } from '../domain/fruit-id';
import { FruitDescription } from '../domain/fruit-description';
import { InMemoryFruitRepository } from './in-memory-fruit-repository';

describe('FruitRepository with in-memory persistence', () => {
  it('finds a saved fruit by normalized name', async () => {
    const repository: FruitRepository = new InMemoryFruitRepository();
    const apple = FruitFactory.create({
      id: FruitId.create('fruit-1'),
      name: '  Apple  ',
      description: 'Sweet',
      storageLimit: 10,
    });

    await repository.save(apple);

    const found = await repository.findByNormalizedName('apple');
    expect(found?.id.value).toBe('fruit-1');
    expect(found?.name.displayName).toBe('Apple');
  });

  it('lists saved fruits and returns an empty list when none exist', async () => {
    const repository: FruitRepository = new InMemoryFruitRepository();
    expect(await repository.list()).toEqual([]);

    const apple = FruitFactory.create({
      id: FruitId.create('fruit-1'),
      name: 'Apple',
      description: 'Sweet',
      storageLimit: 10,
    });
    const pear = FruitFactory.create({
      id: FruitId.create('fruit-2'),
      name: 'Pear',
      description: 'Juicy',
      storageLimit: 5,
    });
    await repository.save(apple);
    await repository.save(pear);

    expect((await repository.list()).map((fruit) => fruit.id.value)).toEqual([
      'fruit-1',
      'fruit-2',
    ]);
  });

  it('persists only saved changes while preserving Fruit identity', async () => {
    const repository: FruitRepository = new InMemoryFruitRepository();
    const apple = FruitFactory.create({
      id: FruitId.create('fruit-1'),
      name: 'Apple',
      description: 'Sweet',
      storageLimit: 10,
    });
    await repository.save(apple);

    apple.store(3);
    expect((await repository.findByNormalizedName('apple'))?.storedAmount).toBe(0);

    await repository.save(apple);
    const saved = await repository.findByNormalizedName('apple');
    expect(saved?.id.value).toBe('fruit-1');
    expect(saved?.storedAmount).toBe(3);
    saved?.update(FruitDescription.create('Crisp'));
    expect((await repository.findByNormalizedName('apple'))?.description.value).toBe('Sweet');
  });

  it('deletes a Fruit so it cannot be found or listed', async () => {
    const repository: FruitRepository = new InMemoryFruitRepository();
    const apple = FruitFactory.create({
      id: FruitId.create('fruit-1'),
      name: 'Apple',
      description: 'Sweet',
      storageLimit: 10,
    });
    await repository.save(apple);

    const saved = await repository.findByNormalizedName('apple');
    if (saved === null) {
      throw new Error('Expected saved Fruit');
    }
    await repository.delete(saved);

    expect(await repository.findByNormalizedName('apple')).toBeNull();
    expect(await repository.list()).toEqual([]);
  });
});
