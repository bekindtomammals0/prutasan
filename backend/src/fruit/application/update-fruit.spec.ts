import { Fruit } from '../domain/fruit';
import { FruitDescription } from '../domain/fruit-description';
import { FruitId } from '../domain/fruit-id';
import { FruitName } from '../domain/fruit-name';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { UpdateFruit } from './update-fruit';
import { FruitNotFoundError } from './find-fruit-or-throw';

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
    expect(fruit.storedAmount).toBe(5);
    expect(fruit.pullDomainEvents()).toEqual([
      expect.objectContaining({ eventType: 'FruitUpdated', aggregateId: existing.id.value }),
    ]);
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

  it.each([
    { limit: 4, error: 'Storage limit should be greater than or equal to stored amount' },
    { limit: null, error: 'Storage limit cannot be null' },
  ])(
    'rejects invalid limit $limit without changing a valid description',
    async ({ limit, error }) => {
      const repository = new InMemoryFruitRepository();
      const existing = Fruit.reconstitute({
        id: FruitId.create('1'),
        name: FruitName.create('Apple'),
        description: FruitDescription.create('A sweet fruit'),
        storageLimit: 10,
        storedAmount: 5,
      });
      await repository.save(existing);
      const save = jest.spyOn(repository, 'save');

      await expect(
        new UpdateFruit(repository).execute({
          name: 'apple',
          description: 'A new description',
          limit,
        }),
      ).rejects.toThrow(error);

      expect(save).not.toHaveBeenCalled();
      const saved = await repository.findByNormalizedName('apple');
      expect(saved?.description.value).toBe('A sweet fruit');
      expect(saved?.storageLimit).toBe(10);
      expect(saved?.storedAmount).toBe(5);
      expect(saved?.pullDomainEvents()).toEqual([]);
    },
  );

  it('updates only the description and preserves the limit and inventory', async () => {
    const repository = new InMemoryFruitRepository();
    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });
    await repository.save(existing);

    const updated = await new UpdateFruit(repository).execute({
      name: 'apple',
      description: 'A crisp fruit',
    });

    expect(updated.description.value).toBe('A crisp fruit');
    expect(updated.storageLimit).toBe(10);
    expect(updated.storedAmount).toBe(5);
    expect(updated.id.equals(existing.id)).toBe(true);
    expect(updated.pullDomainEvents()).toEqual([
      expect.objectContaining({ eventType: 'FruitUpdated', aggregateId: existing.id.value }),
    ]);
  });

  it.each([
    {
      description: 'This description is longer than thirty characters',
      error: 'Description must be 30 characters or less',
    },
    { description: null, error: 'Description cannot be null' },
  ])('rejects invalid description without changing the fruit', async ({ description, error }) => {
    const repository = new InMemoryFruitRepository();
    const existing = Fruit.reconstitute({
      id: FruitId.create('1'),
      name: FruitName.create('Apple'),
      description: FruitDescription.create('A sweet fruit'),
      storageLimit: 10,
      storedAmount: 5,
    });
    await repository.save(existing);
    const save = jest.spyOn(repository, 'save');

    await expect(
      new UpdateFruit(repository).execute({ name: 'apple', description }),
    ).rejects.toThrow(error);

    expect(save).not.toHaveBeenCalled();
    const saved = await repository.findByNormalizedName('apple');
    expect(saved?.description.value).toBe('A sweet fruit');
    expect(saved?.storageLimit).toBe(10);
    expect(saved?.pullDomainEvents()).toEqual([]);
  });

  it('rejects updating a missing fruit with a typed error', async () => {
    await expect(
      new UpdateFruit(new InMemoryFruitRepository()).execute({
        name: 'apple',
        description: 'A sweet fruit',
      }),
    ).rejects.toThrow(FruitNotFoundError);
  });
});
