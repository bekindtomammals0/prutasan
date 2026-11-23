import { Fruit } from '../domain/fruit';
import { FruitName } from '../domain/fruit-name';
import { FruitRepository } from '../domain/fruit-repository';

export class FruitNotFoundError extends Error {
  constructor(name: FruitName) {
    super(`Fruit "${name.displayName}" not found`);
    this.name = 'FruitNotFoundError';
  }
}

export async function findFruitOrThrow(
  repository: FruitRepository,
  rawName: string,
): Promise<Fruit> {
  const name = FruitName.create(rawName);
  const fruit = await repository.findByNormalizedName(name.normalizedName);

  if (!fruit) {
    throw new FruitNotFoundError(name);
  }

  return fruit;
}
