import { Fruit } from '../domain/fruit';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { FruitDescription } from '../domain/fruit-description';
import { ListFruits } from './list-fruits';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';

describe('ListFruits', () => {
  it('returns list of fruits if repository is not empty', async () => {
    const repository = new InMemoryFruitRepository();
    const existing_first = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('Keeps the doctor away'),
      storageLimit: 10,
      storedAmount: 2,
    });
    const existing_second = Fruit.reconstitute({
      id: FruitId.create('2'),
      name: FruitName.create('Orange'),
      description: FruitDescription.create('A circle fruit'),
      storageLimit: 10,
      storedAmount: 2,
    });
    const existing_third = Fruit.reconstitute({
      id: FruitId.create('3'),
      name: FruitName.create('Mango'),
      description: FruitDescription.create('Yellow when ripe'),
      storageLimit: 10,
      storedAmount: 2,
    });
    await repository.save(existing_first);
    await repository.save(existing_second);
    await repository.save(existing_third);

    const listFruits = new ListFruits(repository);
    const fruits = await listFruits.execute();

    expect(fruits).toHaveLength(3);
  });
});
