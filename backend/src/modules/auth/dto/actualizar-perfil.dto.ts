import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para actualizar campos no críticos del perfil propio.
 * HU-03: solo permite editar nombre y teléfono (campos no críticos).
 * El correo e identificación NO son editables desde el perfil propio.
 */
export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede superar 20 caracteres' })
  telefono?: string;
}
