import { Fruit } from '../domain/fruit';
import { CreateFruitInput, FruitFactory } from '../domain/fruit-factory';
import { FruitName } from '../domain/fruit-name';
import { FruitNameUniquenessService } from '../domain/fruit-name-uniqueness';
import { FruitRepository } from '../domain/fruit-repository';

export class CreateFruit {
  constructor(
    private readonly repository: FruitRepository,
    private readonly nameUniqueness: FruitNameUniquenessService,
  ) {}

  async execute(input: CreateFruitInput): Promise<Fruit> {
    const name = FruitName.create(input.name);
    await this.nameUniqueness.checkNameUniqueness(name);

    const fruit = FruitFactory.create({ ...input, name: name.displayName });
    await this.repository.save(fruit);

    return fruit;
  }
}
