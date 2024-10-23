import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubtypeEntity } from './entities/subtype-entity.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';

@Injectable()
export class SubtypeEntityService {
  constructor(
    @InjectRepository(SubtypeEntity)
    private readonly subtypeRepository: Repository<SubtypeEntity>,
    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
  ) { }

  async create(name: string, description: string, typeId: number) {
    // Verificación de duplicados por nombre
    const existingSubtype = await this.subtypeRepository.findOne({ where: { name } });
    if (existingSubtype) {
      throw new HttpException('A subtype with this name already exists', HttpStatus.CONFLICT);
    }

    const subtype = new SubtypeEntity();
    subtype.name = name;
    subtype.description = description || '';

    // Verificación de que el tipo existe
    const type = await this.typeRepository.findOne({ where: { id: typeId } });
    if (!type) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    subtype.type = type;

    // Guardar el nuevo subtipo
    return await this.subtypeRepository.save(subtype);  // Si hay un error inesperado, se lanzará automáticamente.
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

  async update(id: number, name: string, description: string, typeId: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const existingSubtype = await this.subtypeRepository.findOne({ where: { id } });
    if (!existingSubtype) {
      throw new HttpException('Subtype Entity not found', HttpStatus.NOT_FOUND);
    }

    existingSubtype.name = name || existingSubtype.name;
    existingSubtype.description = description || existingSubtype.description;

    if (typeId) {
      const type = await this.typeRepository.findOne({ where: { id: typeId } });
      if (!type) {
        throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
      }
      existingSubtype.type = type;
    }

    await this.subtypeRepository.save(existingSubtype);
    return this.findOne(id);
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