export interface DomainEvent<
    Type extends string = string,
    Payload extends object = object
> {
  readonly eventId: string;
  readonly eventType: Type;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: Payload;
}