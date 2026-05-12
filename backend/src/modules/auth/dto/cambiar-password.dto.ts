import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * DTO para cambiar la contraseña del perfil propio.
 * HU-03: valida que se proporcione la contraseña actual antes de cambiarla.
 */
export class CambiarPasswordDto {
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  password_actual!: string;

  @IsNotEmpty({ message: 'La contraseña nueva es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contraseña nueva debe tener mínimo 8 caracteres' })
  password_nueva!: string;
}
