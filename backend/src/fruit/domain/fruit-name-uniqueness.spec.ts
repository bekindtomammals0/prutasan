import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';
import { FruitFactory } from './fruit-factory';
import { FruitName } from './fruit-name';
import { FruitNameUniquenessService, DuplicateFruitNameError } from './fruit-name-uniqueness';

describe('fruit name uniqueness', () => {
  it('rejects a fruit name already in use', async () => {
    const repository = new InMemoryFruitRepository();
    await repository.save(
      FruitFactory.create({
        name: 'Lemon',
        description: 'Sour',
        storageLimit: 10,
      }),
    );
    const service = new FruitNameUniquenessService(repository);

    await expect(service.checkNameUniqueness(FruitName.create(' lemon '))).rejects.toThrow(
      DuplicateFruitNameError,
    );
  });
});
