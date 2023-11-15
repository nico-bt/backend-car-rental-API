import { ApiProperty } from '@nestjs/swagger';
import { CajaType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

const MIN_YEAR_CARMODEL = 2015;
const MAX_YEAR_CARMODEL = new Date().getFullYear();
const MAX_KM_CAR = 400000;
const MIN_NUM_OF_PASSENGERS = 1;
const MAX_NUM_OF_PASSENGERS = 10;
const MAX_PRICE = 10000;

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsNotEmpty()
  @IsInt()
  @Min(MIN_YEAR_CARMODEL)
  @Max(MAX_YEAR_CARMODEL)
  year: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Max(MAX_KM_CAR)
  km: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsBoolean()
  @IsNotEmpty()
  ac: boolean;

  @IsNotEmpty()
  @IsInt()
  @Min(MIN_NUM_OF_PASSENGERS)
  @Max(MAX_NUM_OF_PASSENGERS)
  pasajeros: number;

  @IsNotEmpty()
  @IsEnum(CajaType)
  @ApiProperty({ enum: CajaType })
  cambios: CajaType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(MAX_PRICE)
  price: number;
}
