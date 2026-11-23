import { FruitRepository } from '../application/fruit-repository';
import { Fruit, ReconstitutedFruit } from '../domain/fruit';

export class InMemoryFruitRepository implements FruitRepository {
  private readonly fruits = new Map<string, ReconstitutedFruit>();

  async findByNormalizedName(normalizedName: string): Promise<Fruit | null> {
    const state = [...this.fruits.values()].find(
      (fruit) => fruit.name.normalizedName === normalizedName,
    );
    return state ? Fruit.reconstitute(state) : null;
  }

  async list(): Promise<readonly Fruit[]> {
    return [...this.fruits.values()].map((state) => Fruit.reconstitute(state));
  }

  async save(fruit: Fruit): Promise<void> {
    this.fruits.set(fruit.id.value, {
      id: fruit.id,
      name: fruit.name,
      description: fruit.description,
      storageLimit: fruit.storageLimit,
      storedAmount: fruit.storedAmount,
    });
  }

  async delete(fruit: Fruit): Promise<void> {
    this.fruits.delete(fruit.id.value);
  }
}
