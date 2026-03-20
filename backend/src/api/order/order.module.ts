import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { UserModule } from '../user/user.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, ProductVariation]), UserModule, InventoryModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
