import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubtypeEntity } from './entities/subtype-entity.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { Facility } from 'src/facilities/entities/facility.entity';

@Injectable()
export class SubtypeEntityService {
  constructor(
    @InjectRepository(SubtypeEntity)
    private readonly subtypeRepository: Repository<SubtypeEntity>,

    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,

    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
  ) { }

  async create(name: string, description: string, typeId: number, facilityIds: number[]) {
    const type = await this.typeRepository.findOne({ where: { id: typeId } });
    if (!type) {
      throw new NotFoundException('Type Entity not found');
    }
  
    const facilities = await this.facilityRepository.findByIds(facilityIds);
    if (facilities.length !== facilityIds.length) {
      throw new NotFoundException('Some facilities not found');
    }
  
    const subtype = new SubtypeEntity();
    subtype.name = name;
    subtype.description = description || '';
    subtype.type = type;
    subtype.facilities = facilities; // Relación con facilities
  
    return await this.subtypeRepository.save(subtype);
  }

  async findAll(
    typeId?: number,
    sortField?: string,  // Campo por defecto para ordenar
    sortOrder?: 'ASC' | 'DESC', // Dirección por defecto
    limit?: number) {
    const options: any = {
      relations: ['type'],
      where: {},
      order: {
        [sortField || 'name']: sortOrder || 'DESC'
      },
    };

    if (typeId) {
      options.where['type'] = { id: typeId };
    }



    if (limit) {
      options.take = limit;
    }

    const result = await this.subtypeRepository.find(options);

    if (result.length === 0) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);  // Si no hay resultados, lanzamos una excepción 204
    }

    return result;
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const result = await this.subtypeRepository.findOne({
      where: { id },
      relations: ['type'],
    });

    if (!result) {
      throw new HttpException('Subtype Entity not found', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async update(id: number, name: string, description: string, typeId: number, facilityIds: number[]) {
    const subtype = await this.findOne(id);
  
    if (typeId) {
      const type = await this.typeRepository.findOne({ where: { id: typeId } });
      if (!type) {
        throw new NotFoundException('Type Entity not found');
      }
      subtype.type = type;
    }
  
    const facilities = await this.facilityRepository.findByIds(facilityIds);
    if (facilities.length !== facilityIds.length) {
      throw new NotFoundException('Some facilities not found');
    }
  
    subtype.name = name || subtype.name;
    subtype.description = description || subtype.description;
    subtype.facilities = facilities; // Relación con facilities
  
    await this.subtypeRepository.save(subtype);
    return this.findOne(id); // Retorna el subtipo actualizado
  }
  async remove(id: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const result = await this.subtypeRepository.findOne({ where: { id } });
    if (!result) {
      throw new HttpException('Subtype Entity not found', HttpStatus.NOT_FOUND);
    }

    await this.subtypeRepository.delete(id);
    return { message: 'Subtype entity deleted successfully' };
  }
}
