import { Fruit } from '../domain/fruit';
import { FruitName } from '../domain/fruit-name';
import { FruitRepository } from '../domain/fruit-repository';
import { FruitDescription } from '../domain/fruit-description';

export type UpdateFruitInput = {
  name: string;
  description?: string;
  limit?: number;
};

export class UpdateFruit {
  constructor(private readonly repository: FruitRepository) {}

  async execute(input: UpdateFruitInput): Promise<Fruit> {
    const name = FruitName.create(input.name);
    const fruit = await this.repository.findByNormalizedName(name.normalizedName);
    if (!fruit) {
      throw new Error(`Fruit "${name.displayName}" not found`);
    }
    if((input.description === undefined) && (input.limit === undefined)){
      throw new Error('Update cannot be performed without any changes to be made');
    }
    const description =
      input.description !== undefined
        ? FruitDescription.create(input.description)
        : fruit.description;

    fruit.update(description, input.limit ?? fruit.storageLimit);
    await this.repository.save(fruit);

    return fruit;
  }
}
