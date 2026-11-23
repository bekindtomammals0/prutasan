import { Fruit } from '../domain/fruit';
import { FruitName } from '../domain/fruit-name';
import { FruitRepository } from '../domain/fruit-repository';

export type StoreFruitInput = {
  name: string;
  amount: number;
};

export class StoreFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: StoreFruitInput): Promise<Fruit> {
    const name = FruitName.create(input.name);
    const fruit = await this.repository.findByNormalizedName(name.normalizedName);

    if (!fruit) {
      throw new Error(`Fruit "${name.displayName}" not found`);
    }

    fruit.store(input.amount);
    await this.repository.save(fruit);

    return fruit;
  }
}
