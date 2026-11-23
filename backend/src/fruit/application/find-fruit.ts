import { Fruit } from '../domain/fruit';
import { FruitName } from '../domain/fruit-name';
import { InMemoryFruitRepository } from '../infrastructure/in-memory-fruit-repository';

export type FindFruitInput = {
  name: string;
};
export class FindFruit {
  constructor(private readonly repository: InMemoryFruitRepository) {}

  async execute(input: FindFruitInput): Promise<Fruit> {
    const name = FruitName.create(input.name);
    const fruit = await this.repository.findByNormalizedName(name.normalizedName);

    if (!fruit) {
      throw new Error(`Fruit "${name.displayName}" not found`);
    }

    return fruit;
  }
}
