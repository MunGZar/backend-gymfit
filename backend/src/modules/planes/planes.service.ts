import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<Plan> {
    const existe = await this.planRepo.findOne({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`El plan "${dto.nombre}" ya existe`);

    const plan = this.planRepo.create({
      nombre: dto.nombre,
      precio: dto.precio,
      duracion_dias: dto.duracion_dias,
      beneficios: dto.beneficios ?? null,
    });
    return this.planRepo.save(plan);
  }

  findAll(): Promise<Plan[]> {
    return this.planRepo.find({ order: { id_plan: 'ASC' } });
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepo.findOne({ where: { id_plan: id } });
    if (!plan) throw new NotFoundException(`Plan con id ${id} no encontrado`);
    return plan;
  }

  async update(id: number, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    // Verificar nombre duplicado solo si se está cambiando
    if (dto.nombre && dto.nombre !== plan.nombre) {
      const existe = await this.planRepo.findOne({ where: { nombre: dto.nombre } });
      if (existe) throw new ConflictException(`El plan "${dto.nombre}" ya existe`);
    }
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepo.remove(plan);
  }
}
