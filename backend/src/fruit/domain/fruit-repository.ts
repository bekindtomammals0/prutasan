import { Fruit } from './fruit';

export interface FruitRepository {
  findByNormalizedName(normalizedName: string): Promise<Fruit | null>;
  list(): Promise<readonly Fruit[]>;
  save(fruit: Fruit): Promise<void>;
  delete(fruit: Fruit): Promise<void>;
}
