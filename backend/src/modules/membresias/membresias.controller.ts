import {
  Controller, Get, Post, Body, Param,
  Put, Patch, Delete, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { MembresiasService } from './membresias.service';
import { CreateMembresiaDto, UpdateMembresiaDto, CambiarEstadoMembresiaDto } from './dto/membresia.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Membresías')
@ApiBearerAuth('JWT-auth')
@Controller('membresias')
export class MembresiasController {
  constructor(private readonly membresiasService: MembresiasService) {}

  // ─── RF-006: Asignar membresía ────────────────────────────────
  @Post()
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Asignar membresía a socio (RF-006)',
    description:
      'Asigna un plan de membresía a un socio. ' +
      'La fecha de fin se calcula automáticamente sumando la duración del plan a la fecha de inicio. ' +
      'No se puede asignar si el socio ya tiene una membresía activa vigente.',
  })
  @ApiBody({ type: CreateMembresiaDto })
  @ApiResponse({ status: 201, description: 'Membresía asignada correctamente' })
  @ApiResponse({ status: 400, description: 'Fecha de inicio inválida' })
  @ApiResponse({ status: 404, description: 'Socio o plan no encontrado' })
  @ApiResponse({ status: 409, description: 'El socio ya tiene una membresía activa vigente' })
  create(@Body() dto: CreateMembresiaDto) { return this.membresiasService.create(dto); }

  @Get()
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Listar todas las membresías' })
  @ApiResponse({ status: 200, description: 'Lista de membresías' })
  findAll() { return this.membresiasService.findAll(); }

  @Get('socio/:idSocio')
  @Roles('admin', 'recepcionista', 'entrenador')
  @ApiOperation({
    summary: 'Membresías de un socio',
    description: 'Retorna el historial completo de membresías de un socio, ordenado del más reciente.',
  })
  @ApiParam({ name: 'idSocio', type: Number, description: 'ID del socio' })
  @ApiResponse({ status: 200, description: 'Lista de membresías del socio' })
  findBySocio(@Param('idSocio', ParseIntPipe) idSocio: number) {
    return this.membresiasService.findBySocio(idSocio);
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({ summary: 'Obtener membresía por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la membresía' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.membresiasService.findOne(id); }

  // ─── RF-007: Cambiar estado de membresía ──────────────────────
  @Patch(':id/estado')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Cambiar estado de membresía (RF-007)',
    description:
      'Actualiza únicamente el estado de una membresía. ' +
      'Estados válidos: activa | vencida | cancelada.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la membresía' })
  @ApiBody({ type: CambiarEstadoMembresiaDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Estado inválido o membresía ya tiene ese estado' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoMembresiaDto,
  ) { return this.membresiasService.cambiarEstado(id, dto); }

  @Put(':id')
  @Roles('admin', 'recepcionista')
  @ApiOperation({
    summary: 'Actualizar membresía (campos generales)',
    description: 'Actualiza plan, fecha de inicio y/o estado. Para cambiar solo el estado usar PATCH /:id/estado.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateMembresiaDto })
  @ApiResponse({ status: 200, description: 'Membresía actualizada' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMembresiaDto) {
    return this.membresiasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar membresía (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Membresía eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.membresiasService.remove(id); }
}
