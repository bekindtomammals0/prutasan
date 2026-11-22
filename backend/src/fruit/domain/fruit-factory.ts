import { FruitDescription } from './fruit-description';
import { FruitId } from './fruit-id';
import { FruitName } from './fruit-name';
import { Fruit } from './fruit';

export type CreateFruitInput = {
  name: string;
  description: string;
  storageLimit: number;
  id?: FruitId;
};

export const FruitFactory = {
  create(input: CreateFruitInput): Fruit {
    const id = input.id ?? FruitId.generate();
    const name = FruitName.create(input.name);
    const description = FruitDescription.create(input.description);

    return Fruit.createNew({
      id,
      name,
      description,
      storageLimit: input.storageLimit,
    });
  },
};
