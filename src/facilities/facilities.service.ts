import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';
import { TypeEntity } from 'src/type-entity/entities/type-entity.entity';

@Injectable()
export class FacilitiesService {

  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(SubtypeEntity)
    private readonly subtypeRepository: Repository<SubtypeEntity>,

    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
  ) { }

  async create(createFacilityDto: CreateFacilityDto) {
    const { subtypeIds } = createFacilityDto;
  
    const subtypes = await this.subtypeRepository.findByIds(subtypeIds);
    if (subtypes.length !== subtypeIds.length) {
      throw new NotFoundException('Some subtypes not found');
    }
  
    const newFacility = this.facilityRepository.create({
      ...createFacilityDto,
      subtypes: subtypes, // Relación con subtypes
    });
  
    return await this.facilityRepository.save(newFacility);
  }

  async findAll() {
    try {
      const types = await this.facilityRepository.find();
      if (types.length === 0) {
        throw new HttpException('No Type Entities found', HttpStatus.NO_CONTENT);
      }
      return types;
    } catch (error) {
      throw new HttpException(`Error fetching Type Entities: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.facilityRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    return typeEntity;
  }

  async update(id: number, name: string, description: string, typeId: number, facilityIds: number[]): Promise<SubtypeEntity> {
    const subtype = await this.subtypeRepository.findOne({ where: { id } });
    if (!subtype) {
      throw new NotFoundException('Subtype not found');
    }
  
    // Actualizamos los campos que se envían
    if (name) {
      subtype.name = name;
    }
    if (description) {
      subtype.description = description;
    }
    if (typeId) {
      const type = await this.typeRepository.findOne({ where: { id: typeId } });
      if (!type) {
        throw new NotFoundException('Type not found');
      }
      subtype.type = type;
    }
  
    // Asignamos las nuevas facilities si existen
    if (facilityIds && facilityIds.length > 0) {
      const facilities = await this.facilityRepository.findByIds(facilityIds);
      subtype.facilities = facilities;
    } else {
      subtype.facilities = [];  // Si no se envían, reseteamos las facilities
    }
  
    return await this.subtypeRepository.save(subtype);
  }

  async remove(id: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.facilityRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.facilityRepository.softDelete(id);
      return { message: 'Type Entity deleted successfully' };
    } catch (error) {
      throw new HttpException(`Error deleting Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async restore(id: number) {
    const result = await this.facilityRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Punto de interes no encontrado');
    }

    return await this.facilityRepository.findOne({ where: { id: id } });
  }
}
