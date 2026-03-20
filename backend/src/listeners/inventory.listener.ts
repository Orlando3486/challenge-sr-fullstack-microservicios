import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductCreatedEvent } from '../events/product-create.event';
import { OrderCreatedEvent } from '../events/order-created.event';
import { InventoryService } from '../api/inventory/services/inventory.service';

@Injectable()
export class InventoryListener {
  constructor(private readonly inventoryService: InventoryService) {}

  @OnEvent('product.created')
  async handleProductCreated(event: ProductCreatedEvent) {
    try {
      await this.inventoryService.initializeInventory(event.productId);
    } catch (error) {
      console.error(
        `Error inicializando inventario para producto ${event.productId}:`,
        error.message,
      );
    }
  }

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    console.log('🛒 Evento: order.created → actualizando stock');
    for (const item of event.products) {
      await this.inventoryService.decreaseStock(
        item.productVariationId,
        item.countryCode,
        item.quantity,
      );
    }
  }
}
