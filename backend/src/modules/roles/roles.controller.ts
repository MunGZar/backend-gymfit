import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * POST /api/roles/seed  — @Public
   * Inserta los 4 roles del sistema solo si la tabla está vacía.
   */
  @Public()
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  seed() {
    return this.rolesService.seed();
  }

  /**
   * GET /api/roles  — @Public
   * Lista los roles disponibles. Pública porque el formulario de registro
   * (HU-01) necesita cargarlos sin token para mostrar el selector de rol.
   */
  @Public()
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * GET /api/roles/:id  — @Public
   * Consulta un rol por id (usada en selectores de formularios).
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  // Mutaciones protegidas — solo admin

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateRolDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
