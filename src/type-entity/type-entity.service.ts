import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateTypeEntityDto } from './dto/create-type-entity.dto';
import { UpdateTypeEntityDto } from './dto/update-type-entity.dto';
import { TypeEntity } from './entities/type-entity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TypeEntityService {
  constructor(
    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
  ) { }

  async create(createTypeEntityDto: CreateTypeEntityDto): Promise<TypeEntity> {
    // Validación: nombre no debe estar vacío
    if (!createTypeEntityDto.name || createTypeEntityDto.name.trim().length === 0) {
      throw new HttpException('The name field is required', HttpStatus.BAD_REQUEST);
    }

    // // Validación: longitud máxima del nombre
    // if (createTypeEntityDto.name.length > 255) {
    //   throw new HttpException('The name field is too long', HttpStatus.BAD_REQUEST);
    // }

    // Si no se proporciona un rol, solicitamos uno
    if (!createTypeEntityDto.role) {
      throw new HttpException('Role is required. Please provide a valid UserRole.', HttpStatus.BAD_REQUEST);
    }

    // Verificar si ya existe un tipo con el rol proporcionado
    const existingType = await this.typeRepository.findOne({ where: { role: createTypeEntityDto.role } });
    if (existingType) {
      throw new HttpException(`A type with role ${createTypeEntityDto.role} already exists`, HttpStatus.CONFLICT);
    }

    // Crear la nueva entidad
    const newType = this.typeRepository.create(createTypeEntityDto);

    // Guardar la entidad en la base de datos
    try {
      return await this.typeRepository.save(newType);
    } catch (error) {
      throw new HttpException(`Error creating Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<CreateTypeEntityDto[]> {
    try {
      const types = await this.typeRepository.find({ relations: ['users', 'subtype', 'cityPoints'] });
      if (types.length === 0) {
        throw new HttpException('No Type Entities found', HttpStatus.NO_CONTENT);
      }
      return types;
    } catch (error) {
      throw new HttpException(`Error fetching Type Entities: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number): Promise<CreateTypeEntityDto> {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.typeRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    return typeEntity;
  }

  async update(id: number, updateTypeEntityDto: UpdateTypeEntityDto) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.typeRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.typeRepository.update(id, updateTypeEntityDto);
      return this.findOne(id); // Devuelve la entidad actualizada
    } catch (error) {
      throw new HttpException(`Error updating Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.typeRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.typeRepository.delete(id);
      return { message: 'Type Entity deleted successfully' };
    } catch (error) {
      throw new HttpException(`Error deleting Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}