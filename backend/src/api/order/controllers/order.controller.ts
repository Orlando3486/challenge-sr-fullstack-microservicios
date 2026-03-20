import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { CurrentUser } from 'src/api/auth/guards/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/order.dto';
import { RoleIds } from 'src/api/role/enum/role.enum';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth(RoleIds.Customer, RoleIds.Admin)
  @Post('create')
  async createOrder(@Body() body: CreateOrderDto, @CurrentUser() user: User) {
    return this.orderService.createOrder(body, user.id);
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Get('inventory/product/:productId')
  async getInventoryByProduct(@Param('productId') productId: string) {
    return this.orderService.getInventoryByProduct(Number(productId));
  }

  @Auth(RoleIds.Admin, RoleIds.Merchant)
  @Get('inventory/:variationId/:countryCode')
  async getInventoryStatus(
    @Param('variationId') variationId: string,
    @Param('countryCode') countryCode: string,
  ) {
    return this.orderService.getInventoryStatus(Number(variationId), countryCode);
  }
}
