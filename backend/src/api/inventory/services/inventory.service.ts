import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async initializeInventory(productId: number): Promise<void> {
    console.log(`Inicializando inventario para productId: ${productId}`);

    const variationResult = await this.entityManager
      .createQueryBuilder()
      .insert()
      .into(ProductVariation)
      .values({
        productId,
        sizeCode: 'NA',
        colorName: 'NA',
        imageUrls: [],
      })
      .returning(['id'])
      .execute();

    const variationId = variationResult.raw[0].id;

    await this.entityManager
      .createQueryBuilder()
      .insert()
      .into(Inventory)
      .values({
        productVariationId: variationId,
        countryCode: 'EG',
        quantity: 0,
      })
      .execute();

    console.log(`Inventario inicializado para producto ${productId}, variación ${variationId}`);
  }

  async decreaseStock(
    productVariationId: number,
    countryCode: string,
    quantity: number,
  ): Promise<void> {
    const inventory = await this.entityManager.findOne(Inventory, {
      where: { productVariationId, countryCode },
    });

    if (!inventory) {
      throw new NotFoundException(
        `No hay inventario para variación ${productVariationId} en ${countryCode}`,
      );
    }

    if (inventory.quantity < quantity) {
      throw new ConflictException(
        `Stock insuficiente: disponible ${inventory.quantity}, solicitado ${quantity}`,
      );
    }

    await this.entityManager.update(Inventory, inventory.id, {
      quantity: inventory.quantity - quantity,
    });

    console.log(
      `✅ Stock actualizado: variación ${productVariationId} → ${
        inventory.quantity - quantity
      } unidades`,
    );
  }

  async getInventoryByProduct(productId: number) {
    return this.entityManager
      .createQueryBuilder(Inventory, 'inventory')
      .leftJoinAndSelect('inventory.productVariation', 'variation')
      .leftJoinAndSelect('inventory.country', 'country')
      .where('variation.productId = :productId', { productId })
      .getMany();
  }
}
