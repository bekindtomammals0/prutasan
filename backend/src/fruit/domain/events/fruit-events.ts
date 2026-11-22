import { randomUUID } from 'node:crypto';
import type { DomainEvent } from './domain-event';
import { FruitDescription } from '../fruit-description';
import { FruitName } from '../fruit-name';

export type FruitCreated = DomainEvent<
  'FruitCreated',
  {
    name: FruitName;
  }
>;

export type FruitUpdated = DomainEvent<
  'FruitUpdated',
  {
    description: FruitDescription;
    storageLimit: number;
  }
>;

export type FruitDeleted = DomainEvent<
  'FruitDeleted',
  {
    name: FruitName;
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
  FruitCreated | FruitUpdated | FruitDeleted | FruitStored | FruitRemoved;

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
