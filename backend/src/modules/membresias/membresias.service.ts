import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membresia } from './entities/membresia.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Plan } from '../planes/entities/plan.entity';
import { CreateMembresiaDto, UpdateMembresiaDto, CambiarEstadoMembresiaDto } from './dto/membresia.dto';

const ESTADOS_VALIDOS = ['activa', 'vencida', 'cancelada'];

@Injectable()
export class MembresiasService {
  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Socio)
    private readonly socioRepo: Repository<Socio>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  // ─── RF-006: Asignar membresía ────────────────────────────────
  // La fecha_fin se calcula automáticamente desde la duración del plan.
  // No se permite asignar una membresía si el socio ya tiene una activa.
  async create(dto: CreateMembresiaDto): Promise<Membresia> {
    const socio = await this.socioRepo.findOne({
      where: { id_socio: dto.id_socio },
      relations: ['usuario'],
    });
    if (!socio) throw new NotFoundException(`Socio con id ${dto.id_socio} no encontrado`);

    const plan = await this.planRepo.findOne({ where: { id_plan: dto.id_plan } });
    if (!plan) throw new NotFoundException(`Plan con id ${dto.id_plan} no encontrado`);

    // Verificar que no haya membresía activa vigente para este socio
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const membresiaActiva = await this.membresiaRepo
      .createQueryBuilder('m')
      .where('m.socio_id = :id', { id: dto.id_socio })
      .andWhere('m.estado = :estado', { estado: 'activa' })
      .andWhere('m.fecha_fin >= :hoy', { hoy: hoy.toISOString().split('T')[0] })
      .getOne();

    if (membresiaActiva) {
      throw new ConflictException(
        `El socio ya tiene una membresía activa vigente hasta ${membresiaActiva.fecha_fin}. ` +
        `Cancélela o espere a que venza antes de asignar una nueva.`,
      );
    }

    // Calcular fecha_fin automáticamente: fecha_inicio + duracion_dias del plan
    const inicio = new Date(dto.fecha_inicio);
    if (isNaN(inicio.getTime())) {
      throw new BadRequestException('La fecha de inicio no es válida');
    }
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracion_dias);
    const fecha_fin = fin.toISOString().split('T')[0];

    const membresia = this.membresiaRepo.create({
      socio,
      plan,
      fecha_inicio: dto.fecha_inicio,
      fecha_fin,
      estado: 'activa',
    });
    return this.membresiaRepo.save(membresia);
  }

  findAll(): Promise<Membresia[]> {
    return this.membresiaRepo.find({
      relations: ['socio', 'socio.usuario', 'plan'],
      order: { id_membresia: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Membresia> {
    const m = await this.membresiaRepo.findOne({
      where: { id_membresia: id },
      relations: ['socio', 'socio.usuario', 'plan'],
    });
    if (!m) throw new NotFoundException(`Membresía con id ${id} no encontrada`);
    return m;
  }

  findBySocio(idSocio: number): Promise<Membresia[]> {
    return this.membresiaRepo.find({
      where: { socio: { id_socio: idSocio } },
      relations: ['plan'],
      order: { id_membresia: 'DESC' },
    });
  }

  // ─── RF-007: Cambiar estado de membresía ──────────────────────
  // Endpoint dedicado: PATCH /membresias/:id/estado
  // Estados válidos: activa | vencida | cancelada
  async cambiarEstado(id: number, dto: CambiarEstadoMembresiaDto): Promise<Membresia> {
    const estado = dto.estado.toLowerCase().trim();
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new BadRequestException(
        `Estado inválido: "${dto.estado}". Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}.`,
      );
    }

    const m = await this.findOne(id);
    if (m.estado === estado) {
      throw new BadRequestException(`La membresía ya tiene el estado "${estado}".`);
    }

    m.estado = estado;
    return this.membresiaRepo.save(m);
  }

  // Actualización general (campos opcionales)
  async update(id: number, dto: UpdateMembresiaDto): Promise<Membresia> {
    const m = await this.findOne(id);

    if (dto.estado) {
      const estado = dto.estado.toLowerCase().trim();
      if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new BadRequestException(
          `Estado inválido: "${dto.estado}". Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}.`,
        );
      }
      dto.estado = estado;
    }

    if (dto.fecha_inicio && dto.id_plan) {
      const plan = await this.planRepo.findOne({ where: { id_plan: dto.id_plan } });
      if (!plan) throw new NotFoundException(`Plan con id ${dto.id_plan} no encontrado`);
      const fin = new Date(dto.fecha_inicio);
      fin.setDate(fin.getDate() + plan.duracion_dias);
      (dto as any).fecha_fin = fin.toISOString().split('T')[0];
    }

    Object.assign(m, dto);
    return this.membresiaRepo.save(m);
  }

  async remove(id: number): Promise<void> {
    const m = await this.findOne(id);
    await this.membresiaRepo.remove(m);
  }
}
