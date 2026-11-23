import { Fruit } from '../domain/fruit';
import { FruitRepository } from '../domain/fruit-repository';
import { FruitDescription } from '../domain/fruit-description';
import { findFruitOrThrow } from './find-fruit-or-throw';

export type UpdateFruitInput = {
  name: string;
  description?: string | null;
  limit?: number | null;
};

export class UpdateFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: UpdateFruitInput): Promise<Fruit> {
    const fruit = await findFruitOrThrow(this.repository, input.name);
    if (input.description === undefined && input.limit === undefined) {
      throw new Error('Update cannot be performed without any changes to be made');
    }
    if (input.description === null) {
      throw new Error('Description cannot be null');
    }
    if (input.limit === null) {
      throw new Error('Storage limit cannot be null');
    }
    const description =
      input.description !== undefined
        ? FruitDescription.create(input.description)
        : fruit.description;

    fruit.update(description, input.limit === undefined ? fruit.storageLimit : input.limit);
    await this.repository.save(fruit);

    return fruit;
  }
}
