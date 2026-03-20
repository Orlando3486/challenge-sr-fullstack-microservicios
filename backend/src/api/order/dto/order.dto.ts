import { Type } from 'class-transformer';
import { ArrayMinSize, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  public productVariationId: number;

  @IsNumber()
  @IsNotEmpty()
  public quantity: number;

  @IsString()
  @IsNotEmpty()
  public countryCode: string;
}

export class CreateOrderDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  public products: OrderItemDto[];
}
