import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/register — HU-01 */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /api/auth/login — HU-02 */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /api/auth/perfil — HU-03
   * Retorna los datos del usuario autenticado sin el campo password.
   * El decorador @UsuarioActual() inyecta el usuario desde request.user
   * (que fue validado y poblado por JwtStrategy.validate()).
   */
  @Get('perfil')
  perfil(@UsuarioActual() usuario: Usuario) {
    return this.authService.perfil(usuario.id_usuario);
  }

  /**
   * PUT /api/auth/perfil — HU-03
   * Actualiza nombre y/o teléfono (campos no críticos).
   */
  @Put('perfil')
  @HttpCode(HttpStatus.OK)
  actualizarPerfil(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: ActualizarPerfilDto,
  ) {
    return this.authService.actualizarPerfil(usuario.id_usuario, dto);
  }

  /**
   * PUT /api/auth/perfil/password — HU-03
   * Cambia la contraseña verificando primero la actual con bcrypt.compare.
   * IMPORTANTE: esta ruta debe ir ANTES de 'perfil' para que NestJS
   * no la confunda con PUT /api/auth/perfil/:id.
   */
  @Put('perfil/password')
  @HttpCode(HttpStatus.OK)
  cambiarPassword(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.authService.cambiarPassword(usuario.id_usuario, dto);
  }
}
