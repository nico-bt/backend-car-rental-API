import { CajaType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateCarDto {
  @IsString()
  @IsOptional()
  marca: string;

  @IsString()
  @IsOptional()
  modelo: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(600000)
  km: number;

  @IsString()
  @IsOptional()
  color: string;

  @IsBoolean()
  @IsOptional()
  ac: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  pasajeros: number;

  @IsOptional()
  @IsEnum(CajaType)
  cambios: CajaType;
}
