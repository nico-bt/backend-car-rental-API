import { ApiProperty } from '@nestjs/swagger';
import { DocumentoType } from '@prisma/client';

export class ClientResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  @ApiProperty({ enum: DocumentoType })
  tipo_documento: DocumentoType;
  nro_documento: string;
  nacionalidad: string;
  direccion: string;
  telefono: string;
  email: string;
  fecha_nacimiento: Date;
  created_at: Date;
  updated_at: Date;
  is_renting: boolean;
  is_deleted: boolean;
}
