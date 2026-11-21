import {randomUUID} from 'node:crypto';
import type { DomainEvent } from './domain-event';


export type FruitCreated = DomainEvent<
  'FruitCreated',
  {
    name: string;
  }
>;

export type FruitUpdated = DomainEvent<
  'FruitUpdated',
  {
    description: string,
    storageLimit: number;
  }
>;

export type FruitDeleted = DomainEvent<
  'FruitDeleted',
  {
    name: string;
    discardedAmount: number;
  }
>;

export type FruitStored = DomainEvent<
  'FruitStored',
  {
    amount: number;
    storedAmount: number;
  }
>;

export type FruitRemoved = DomainEvent<
  'FruitRemoved',
  {
    amount: number;
    storedAmount: number;
  }
>;

export type FruitDomainEvent =
  | FruitCreated
  | FruitUpdated
  | FruitDeleted
  | FruitStored
  | FruitRemoved;

type EventInput = {
  [Event in FruitDomainEvent as Event['eventType']]: Event['payload'];
};

export function createFruitEvent<Type extends keyof EventInput>(
  eventType: Type,
  aggregateId: string,
  payload: EventInput[Type],
): Extract<FruitDomainEvent, { eventType: Type }> {
  return {
    eventId: randomUUID(),
    eventType,
    aggregateId,
    occurredAt: new Date(),
    payload,
  } as Extract<FruitDomainEvent, { eventType: Type }>;
}