export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly products: any[],
    public readonly userId: string,
  ) {}
}
