export class FruitDescription {
  private constructor(public readonly value: string) {}

  static create(rawDescription: string): FruitDescription {
    let trimmedDescription = rawDescription.trim();
    if (!rawDescription || trimmedDescription.length === 0) {
      throw new Error('Description cannot be empty');
    } else if (trimmedDescription.length > 30) {
      throw new Error('Description must be 30 characters or less');
    } else {
      return new FruitDescription(trimmedDescription);
    }
  }
  equals(other: FruitDescription): boolean {
    return this.value === other.value;
  }
}
