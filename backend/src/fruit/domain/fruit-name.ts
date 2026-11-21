export class FruitName {
  private constructor(
    public readonly displayName: string,
    public readonly normalizedName: string,
  ) {}
  static create(rawName: string): FruitName {
    if (!rawName || rawName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    } else {
      const displayName = rawName.trim();
      const normalizedName = displayName.trim().toLowerCase();
      return new FruitName(displayName, normalizedName);
    }
  }
  equals(other: FruitName): boolean {
    return this.normalizedName === other.normalizedName;
  }
}
