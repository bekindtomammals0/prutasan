import { error } from 'console';
import { FruitDescription } from './fruit-description';
import { FruitName } from './fruit-name';
import { FruitDomainEvent } from './events/fruit-events';

export type ReconstitutedFruit = {
  id: string;
  name: FruitName;
  description: FruitDescription;
  storageLimit: number;
  storedAmount: number;
};

export class Fruit {
  // The aggregate should record events in-memory until persistence and outbox transactions commit successfully.
  private readonly domainEvents: FruitDomainEvent[] = [];

  private record(event: FruitDomainEvent): void{
    this.domainEvents.push(event);
  }

  pullDomainEvents(): readonly FruitDomainEvent[]{
    return [...this.domainEvents];
  }

  clearDomainEvents(): void{
    this.domainEvents.length = 0;
  }

  private constructor(
    public readonly id: string,
    public readonly name: FruitName,
    private _description: FruitDescription,
    private _storageLimit: number,
    private _storedAmount: number,
  ) {
    this.name = name;
    this._description = _description;
    this._storageLimit = _storageLimit;
    this._storedAmount = _storedAmount;
  }
  static reconstitute(state: ReconstitutedFruit): Fruit {
    return new Fruit(
      state.id,
      state.name,
      state.description,
      state.storageLimit,
      state.storedAmount,
    );
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
  }

  remove(amount: number): void {
    if (this._storedAmount < amount) {
      throw new Error('Remove amount should be less than stored amount');
    } else if (amount <= 0) {
      throw new Error('Remove amount should be greater than 0');
    } else if (!Number.isInteger(amount)) {
      throw new Error('Remove amount must be an integer');
    }
    this._storedAmount = this._storedAmount - amount;
  }

  update(description: FruitDescription, storageLimit: number = this._storageLimit): void {
    this._description = description;
    if (storageLimit <= 0) {
      throw new Error('Storage limit should always be greater than 0');
    } else if (storageLimit - this._storedAmount < 0) {
      throw new Error('Storage limit should be greater than or equal to stored amount');
    }
    this._storageLimit = storageLimit;
  }

  // Domain should not connect to MongoDB and repository but still contain the logic to verify whether deletion is allowed.
  verifyDeletionAllowed(forceDelete: boolean): void{
    if(this._storedAmount > 0 && forceDelete != true){
      throw new Error('Fruit deletion is not allowed on non-emtpy storage');
    }
  }
}
