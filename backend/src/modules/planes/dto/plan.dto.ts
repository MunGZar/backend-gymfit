import {
  IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'Plan Mensual', description: 'Nombre del plan', maxLength: 100 })
  @IsNotEmpty({ message: 'El nombre del plan es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 50000, description: 'Precio del plan (mayor a 0)' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio!: number;

  @ApiProperty({ example: 30, description: 'Duración en días (mínimo 1)' })
  @IsNotEmpty({ message: 'La duración en días es obligatoria' })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración debe ser al menos 1 día' })
  duracion_dias!: number;

  @ApiPropertyOptional({
    example: 'Acceso ilimitado, clases grupales, evaluación mensual',
    description: 'Descripción de beneficios incluidos en el plan (opcional)',
  })
  @IsOptional()
  @IsString()
  beneficios?: string;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
