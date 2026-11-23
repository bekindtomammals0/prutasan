import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';

export class ListFruits {
  constructor(private readonly repository: FruitRepository) {}

  async execute(): Promise<readonly Fruit[]> {
    return this.repository.list();
  }
}
