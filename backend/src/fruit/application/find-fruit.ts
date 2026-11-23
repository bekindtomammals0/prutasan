import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';
import { findFruitOrThrow } from './find-fruit-or-throw';

export type FindFruitInput = {
  name: string;
};
export class FindFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: FindFruitInput): Promise<Fruit> {
    return findFruitOrThrow(this.repository, input.name);
  }
}
