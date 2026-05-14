import {
  IsDateString, IsInt, IsNotEmpty, IsOptional,
  IsPositive, IsString, MaxLength,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembresiaDto {
  @ApiProperty({ example: 1, description: 'ID del socio al que se asigna la membresía' })
  @IsNotEmpty({ message: 'El id del socio es obligatorio' })
  @IsInt()
  @IsPositive()
  id_socio!: number;

  @ApiProperty({ example: 2, description: 'ID del plan de membresía a asignar' })
  @IsNotEmpty({ message: 'El id del plan es obligatorio' })
  @IsInt()
  @IsPositive()
  id_plan!: number;

  @ApiProperty({
    example: '2026-05-13',
    description:
      'Fecha de inicio de la membresía (YYYY-MM-DD). ' +
      'La fecha de fin se calcula automáticamente sumando la duración del plan.',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' })
  fecha_inicio!: string;
}

// RF-007: DTO dedicado para cambiar solo el estado de una membresía
export class CambiarEstadoMembresiaDto {
  @ApiProperty({
    example: 'activa',
    description: 'Estado de la membresía',
    enum: ['activa', 'vencida', 'cancelada'],
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsString()
  @MaxLength(20)
  estado!: string;
}

export class UpdateMembresiaDto extends PartialType(
  OmitType(CreateMembresiaDto, ['id_socio'] as const),
) {
  @ApiPropertyOptional({
    example: 'activa',
    description: 'Estado de la membresía (activa, vencida, cancelada)',
    enum: ['activa', 'vencida', 'cancelada'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string;
}
