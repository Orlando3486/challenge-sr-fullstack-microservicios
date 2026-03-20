import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrderDto } from '../dto/order.dto';
import { OrderCreatedEvent } from 'src/events/order-created.event';
import { Inventory } from 'src/database/entities/inventory.entity';
import { InventoryService } from 'src/api/inventory/services/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly inventoryService: InventoryService,
  ) {}

  async createOrder(data: CreateOrderDto, userId: number) {
    for (const item of data.products) {
      const inventory = await this.entityManager.findOne(Inventory, {
        where: {
          productVariationId: item.productVariationId,
          countryCode: item.countryCode,
        },
      });

      if (!inventory) {
        throw new NotFoundException(
          `No hay inventario para variación ${item.productVariationId} en ${item.countryCode}`,
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new NotFoundException(
          `Stock insuficiente para variación ${item.productVariationId}: disponible ${inventory.quantity}, solicitado ${item.quantity}`,
        );
      }
    }

    const orderId = `order-${Date.now()}-${userId}`;
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(orderId, data.products, String(userId)),
    );

    return {
      orderId,
      status: 'processing',
      message: 'Orden creada, procesando inventario',
      products: data.products,
    };
  }

  async getInventoryByProduct(productId: number) {
    return this.inventoryService.getInventoryByProduct(productId);
  }

  async getInventoryStatus(productVariationId: number, countryCode: string) {
    const inventory = await this.entityManager.findOne(Inventory, {
      where: { productVariationId, countryCode },
      relations: ['productVariation', 'country'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventario no encontrado');
    }

    return inventory;
  }
}
