import { Fruit } from "../domain/fruit";
import { FruitName } from "../domain/fruit-name";
import { FruitRepository } from "../domain/fruit-repository"

export type DeleteFruitInput = {
  name: string,
  forceDelete: boolean,
}

export class DeleteFruit {
  constructor(private readonly repository:FruitRepository) {}

  async execute (input: DeleteFruitInput): Promise<Fruit>{
    const name = FruitName.create(input.name);
    const fruit = await this.repository.findByNormalizedName(name.normalizedName);
    
    if (!fruit) {
      throw new Error(`Fruit "${name.displayName}" not found`);
    }

    fruit.verifyDeletionAllowed(input.forceDelete);
    await this.repository.delete(fruit);

    return fruit;
  }
}