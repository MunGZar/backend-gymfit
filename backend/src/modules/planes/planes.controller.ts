import {
  Controller, Get, Post, Body, Param,
  Put, Delete, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { PlanesService } from './planes.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Planes')
@ApiBearerAuth('JWT-auth')
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  // RF-005: Crear plan de membresía
  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Crear plan de membresía (RF-005)',
    description:
      'Crea un nuevo plan con nombre, precio, duración en días y beneficios opcionales. ' +
      'Solo accesible por administradores.',
  })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({ status: 201, description: 'Plan creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de validación incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — solo admin' })
  @ApiResponse({ status: 409, description: 'Ya existe un plan con ese nombre' })
  create(@Body() dto: CreatePlanDto) { return this.planesService.create(dto); }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar todos los planes',
    description: 'Retorna todos los planes de membresía disponibles con sus beneficios. Endpoint público.',
  })
  @ApiResponse({ status: 200, description: 'Lista de planes' })
  findAll() { return this.planesService.findAll(); }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener plan por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del plan' })
  @ApiResponse({ status: 200, description: 'Datos del plan' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.planesService.findOne(id); }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Actualizar plan (admin)',
    description: 'Actualiza cualquier campo del plan incluyendo beneficios.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePlanDto })
  @ApiResponse({ status: 200, description: 'Plan actualizado' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.planesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar plan (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Plan eliminado' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.planesService.remove(id); }
}
