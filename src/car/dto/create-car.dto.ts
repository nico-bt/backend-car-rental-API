import { CajaType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  year: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  km: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsBoolean()
  @IsNotEmpty()
  ac: boolean;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  pasajeros: number;

  @IsNotEmpty()
  @IsEnum(CajaType)
  cambios: CajaType;
}
