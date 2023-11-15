import { CarResponseDto } from 'src/car/dto/car-response.dto';
import { ClientResponseDto } from 'src/client/dto/client-response.dto';

export class CreateTransactionResponseDto {
  id: number;
  clientId: number;
  carId: number;
  start_date: Date;
  finish_date: Date;
  price_per_day: number;
  total_price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}
export class TransactionResponseDto {
  id: number;
  clientId: number;
  carId: number;
  start_date: Date;
  finish_date: Date;
  price_per_day: number;
  total_price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  client: ClientResponseDto;
  car: CarResponseDto;
}
