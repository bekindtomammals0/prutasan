import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';
import { findFruitOrThrow } from './find-fruit-or-throw';

export type StoreFruitInput = {
  name: string;
  amount: number;
};

export class StoreFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: StoreFruitInput): Promise<Fruit> {
    const fruit = await findFruitOrThrow(this.repository, input.name);

    fruit.store(input.amount);
    await this.repository.save(fruit);

    return fruit;
  }
}
