import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,


    @InjectRepository(SubtypeEntity)
    private readonly subtypeRepository: Repository<SubtypeEntity>,
  ) { }

async create(createFacilityDto: CreateFacilityDto): Promise<Facility> {
    const { subtypeIds, ...facilityData } = createFacilityDto;

    // Verificar si los subtipos existen y cargar la relación con TypeEntity
    const subtypes = await this.subtypeRepository
      .createQueryBuilder('subtype')
      .where('subtype.id IN (:...subtypeIds)', { subtypeIds })
      .leftJoinAndSelect('subtype.type', 'type')  // Cargar el tipo relacionado
      .getMany();

    // Extraer los IDs que realmente existen
    const existingSubtypeIds = subtypes.map(subtype => subtype.id);
    
    // Encontrar los IDs que no existen
    const missingSubtypeIds = subtypeIds.filter(id => !existingSubtypeIds.includes(id));

    if (missingSubtypeIds.length > 0) {
      // Lanzar excepción con los IDs no encontrados
      throw new NotFoundException(`The following subtype IDs were not found: ${missingSubtypeIds.join(', ')}`);
    }

    // Verificar que todos los subtipos tengan type.id = 3
    const invalidSubtypes = subtypes.filter(subtype => !subtype.type || subtype.type.id !== 3);
    if (invalidSubtypes.length > 0) {
      const invalidSubtypeIds = invalidSubtypes.map(subtype => subtype.id);
      throw new BadRequestException(`The following subtype IDs do not have type HOSPITALITY: ${invalidSubtypeIds.join(', ')}`);
    }

    // Crear la facility con los subtipos válidos
    const facility = this.facilityRepository.create({
      ...facilityData,
      subtypes,
    });

    return this.facilityRepository.save(facility);
  }
  async findAll(): Promise<Facility[]> {
    return this.facilityRepository.find({
      relations:['subtypes']
    });
  }

  async findOne(id: number): Promise<Facility> {
    const facility = await this.facilityRepository.findOne({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }
    return facility;
  }

  async update(id: number, updateFacilityDto: UpdateFacilityDto): Promise<Facility> {
    const facility = await this.findOne(id);
    Object.assign(facility, updateFacilityDto);
    return this.facilityRepository.save(facility);
  }

  async remove(id: number): Promise<void> {
    const facility = await this.findOne(id);
    await this.facilityRepository.remove(facility);
  }
}
