import { CajaType } from '@prisma/client';

export class CarResponseDto {
  id: number;
  marca: string;
  modelo: string;
  year: number;
  km: number;
  color: string;
  ac: boolean;
  pasajeros: number;
  cambios: CajaType;
  price: number;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  is_rented: boolean;
}
