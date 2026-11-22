import { FruitDescription } from './fruit-description';
import { FruitName } from './fruit-name';
import { createFruitEvent, FruitDomainEvent } from './events/fruit-events';

export type ReconstitutedFruit = {
  id: string;
  name: FruitName;
  description: FruitDescription;
  storageLimit: number;
  storedAmount: number;
};

export type NewFruit = {
  id: string;
  name: FruitName;
  description: FruitDescription;
  storageLimit: number;
};

export class Fruit {
  private constructor(
    public readonly id: string,
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
      createFruitEvent('FruitCreated', fruit.id, {
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

  // The aggregate should record events in-memory until persistence and outbox transactions commit successfully.
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
    if (amount <= 0) {
      throw new Error('Store amount must be greater than 0');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Store amount must be an integer');
    }
    if (this._storedAmount + amount > this._storageLimit) {
      throw new Error('Storage limit exceeded');
    }

    this._storedAmount += amount;

    this.record(
      createFruitEvent('FruitStored', this.id, {
        amount,
        storedAmount: this._storedAmount,
      }),
    );
  }

  remove(amount: number): void {
    if (this._storedAmount < amount) {
      throw new Error('Remove amount should be less than stored amount');
    }
    if (amount <= 0) {
      throw new Error('Remove amount should be greater than 0');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Remove amount must be an integer');
    }

    this._storedAmount = this._storedAmount - amount;

    this.record(
      createFruitEvent('FruitRemoved', this.id, {
        amount,
        storedAmount: this._storedAmount,
      }),
    );
  }

  update(description: FruitDescription, storageLimit: number = this._storageLimit): void {
    Fruit.assertValidStorageLimit(storageLimit);
    if (storageLimit - this._storedAmount < 0) {
      throw new Error('Storage limit should be greater than or equal to stored amount');
    }
    this._description = description;
    this._storageLimit = storageLimit;

    this.record(
      createFruitEvent('FruitUpdated', this.id, {
        description: this._description,
        storageLimit: this._storageLimit,
      }),
    );
  }

  // Domain should not connect to MongoDB and repository but still contain the logic to verify whether deletion is allowed.
  verifyDeletionAllowed(forceDelete: boolean): void {
    if (typeof forceDelete !== 'boolean') {
      throw new Error('Force delete must be a boolean');
    }
    
    if (this._storedAmount > 0 && !forceDelete) {
      throw new Error('Fruit deletion is not allowed on non-emtpy storage');
    }

    this.record(
      createFruitEvent('FruitDeleted', this.id, {
        name: this.name,
        discardedAmount: this._storedAmount,
      }),
    );
  }
}
