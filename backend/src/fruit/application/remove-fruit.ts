import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';
import { findFruitOrThrow } from './find-fruit-or-throw';

export type RemoveFruitInput = {
  name: string;
  amount: number;
};

export class RemoveFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: RemoveFruitInput): Promise<Fruit> {
    const fruit = await findFruitOrThrow(this.repository, input.name);

    fruit.remove(input.amount);
    await this.repository.save(fruit);

    return fruit;
  }
}
