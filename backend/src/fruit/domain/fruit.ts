import { FruitDescription } from './fruit-description';
import { FruitId } from './fruit-id';
import { FruitName } from './fruit-name';
import { createFruitEvent, FruitDomainEvent } from './events/fruit-events';

export type ReconstitutedFruit = {
  id: FruitId;
  name: FruitName;
  description: FruitDescription;
  storageLimit: number;
  storedAmount: number;
};

export type NewFruit = {
  id: FruitId;
  name: FruitName;
  description: FruitDescription;
  storageLimit: number;
};

export class Fruit {
  private constructor(
    public readonly id: FruitId,
    public readonly name: FruitName,
    private _description: FruitDescription,
    private _storageLimit: number,
    private _storedAmount: number,
  ) {}

  private static assertValidStorageLimit(storageLimit: number): void {
    if (!Number.isInteger(storageLimit)) {
      throw new Error('Storage limit must be an integer');
    }
    if (storageLimit < 0) {
      throw new Error('Storage limit should always be greater than 0');
    }
  }

  private static assertValidStoredAmount(storedAmount: number, storageLimit: number): void {
    if (!Number.isInteger(storedAmount)) {
      throw new Error('Stored amount must be an integer');
    }
    if (storedAmount < 0) {
      throw new Error('Stored amount cannot be negative');
    }
    if (storedAmount > storageLimit) {
      throw new Error('Stored amount cannot exceed storage limit');
    }
  }

  static createNew(state: NewFruit): Fruit {
    Fruit.assertValidStorageLimit(state.storageLimit);

    const fruit = new Fruit(state.id, state.name, state.description, state.storageLimit, 0);

    fruit.record(
      createFruitEvent('FruitCreated', fruit.id.value, {
        name: fruit.name,
      }),
    );

    return fruit;
  }

  static reconstitute(state: ReconstitutedFruit): Fruit {
    Fruit.assertValidStorageLimit(state.storageLimit);
    Fruit.assertValidStoredAmount(state.storedAmount, state.storageLimit);

    return new Fruit(
      state.id,
      state.name,
      state.description,
      state.storageLimit,
      state.storedAmount,
    );
  }

  // Events remain pending until persistence and the outbox transaction commit.
  private readonly domainEvents: FruitDomainEvent[] = [];

  private record(event: FruitDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): readonly FruitDomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents.length = 0;
  }

  get storedAmount(): number {
    return this._storedAmount;
  }

  get storageLimit(): number {
    return this._storageLimit;
  }

  get description(): FruitDescription {
    return this._description;
  }

  store(amount: number): void {
    this.assertCanStore(amount);

    this._storedAmount += amount;

    this.record(
      createFruitEvent('FruitStored', this.id.value, {
        amount,
        storedAmount: this._storedAmount,
      }),
    );
  }

  private assertCanStore(amount: number): void {
    if (amount <= 0) {
      throw new Error('Store amount must be greater than 0');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Store amount must be an integer');
    }
    if (this._storedAmount + amount > this._storageLimit) {
      throw new Error('Storage limit exceeded');
    }
  }

  remove(amount: number): void {
    this.assertCanRemove(amount);

    this._storedAmount -= amount;

    this.record(
      createFruitEvent('FruitRemoved', this.id.value, {
        amount,
        storedAmount: this._storedAmount,
      }),
    );
  }

  private assertCanRemove(amount: number): void {
    if (this._storedAmount < amount) {
      throw new Error('Remove amount should be less than stored amount');
    }
    if (amount <= 0) {
      throw new Error('Remove amount should be greater than 0');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Remove amount must be an integer');
    }
  }

  update(description: FruitDescription, storageLimit: number = this._storageLimit): void {
    this.assertCanUpdate(storageLimit);

    this._description = description;
    this._storageLimit = storageLimit;

    this.record(
      createFruitEvent('FruitUpdated', this.id.value, {
        description: this._description,
        storageLimit: this._storageLimit,
      }),
    );
  }

  private assertCanUpdate(storageLimit: number): void {
    Fruit.assertValidStorageLimit(storageLimit);
    if (storageLimit < this._storedAmount) {
      throw new Error('Storage limit should be greater than or equal to stored amount');
    }
  }

  verifyDeletionAllowed(forceDelete: boolean): void {
    this.assertCanDelete(forceDelete);

    this.record(
      createFruitEvent('FruitDeleted', this.id.value, {
        name: this.name,
        discardedAmount: this._storedAmount,
      }),
    );
  }

  private assertCanDelete(forceDelete: boolean): void {
    if (typeof forceDelete !== 'boolean') {
      throw new Error('Force delete must be a boolean');
    }

    if (this._storedAmount > 0 && !forceDelete) {
      throw new Error('Fruit deletion is not allowed on non-emtpy storage');
    }
  }
}
