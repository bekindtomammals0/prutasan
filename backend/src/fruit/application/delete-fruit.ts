import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';
import { findFruitOrThrow } from './find-fruit-or-throw';

export type DeleteFruitInput = {
  name: string;
  forceDelete: boolean;
};

export class DeleteFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: DeleteFruitInput): Promise<Fruit> {
    const fruit = await findFruitOrThrow(this.repository, input.name);

    fruit.verifyDeletionAllowed(input.forceDelete);
    await this.repository.delete(fruit);

    return fruit;
  }
}
