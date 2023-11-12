import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  carId: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  finish_date: string;
}
