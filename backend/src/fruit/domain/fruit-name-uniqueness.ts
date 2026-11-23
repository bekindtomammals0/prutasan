import { FruitName } from './fruit-name';
import { FruitRepository } from './fruit-repository';

export class DuplicateFruitNameError extends Error {
  constructor(name: FruitName) {
    super(`Fruit name" ${name.displayName}" already exists`);
    this.name = 'DuplicateFruitNameError';
  }
}
export class FruitNameUniquenessService {
  constructor(private readonly repository: FruitRepository) {}

  async checkNameUniqueness(name: FruitName): Promise<void> {
    const existing = await this.repository.findByNormalizedName(name.normalizedName);

    if (existing) {
      throw new DuplicateFruitNameError(name);
    }
  }
}
