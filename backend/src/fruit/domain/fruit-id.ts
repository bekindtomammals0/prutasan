import { randomUUID } from 'node:crypto';

export class FruitId {
  private constructor(public readonly value: string) {}

  static create(value: string): FruitId {
    if (value.trim().length === 0) {
      throw new Error('Fruit ID cannot be empty');
    }

    return new FruitId(value);
  }

  static generate(): FruitId {
    return new FruitId(randomUUID());
  }

  equals(other: FruitId): boolean {
    return this.value === other.value;
  }
}
