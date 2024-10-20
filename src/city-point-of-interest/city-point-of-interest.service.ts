import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, IsNull, Not } from 'typeorm';
import { CreateCityPointOfInterestDto } from './dto/create-city-point-of-interest.dto';
import { UpdateCityPointOfInterestDto } from './dto/update-city-point-of-interest.dto';
import { CityPointOfInterest } from './entities/city-point-of-interest.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { SubtypeEntity } from '../subtype-entity/entities/subtype-entity.entity';
import { User } from '../user/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class CityPointOfInterestService {
  constructor(
    @InjectRepository(CityPointOfInterest)
    private cityPointOfInterestRepository: Repository<CityPointOfInterest>,

    @InjectRepository(TypeEntity)
    private typeRepository: Repository<TypeEntity>, // Repositorio para TypeEntity

    @InjectRepository(SubtypeEntity)
    private subtypeRepository: Repository<SubtypeEntity>, // Repositorio para SubtypeEntity

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createCityPointOfInterestDto: CreateCityPointOfInterestDto): Promise<CityPointOfInterest> {
    const { name, typeId, subtypeId, idUser, images } = createCityPointOfInterestDto;
  
    // (El resto de la lógica de validación)
  
    const newCityPoint = this.cityPointOfInterestRepository.create({
      ...createCityPointOfInterestDto,
      images: Array.isArray(images) ? images : [],  // Asegura que sea un array de imágenes
    });
  
    return this.cityPointOfInterestRepository.save(newCityPoint);
  }

  async findDeleted() {
    return this.cityPointOfInterestRepository.find({
      where: { deletedAt: Not(IsNull()) },
      relations: ['type', 'subtype'],  // Cargar relaciones
      withDeleted: true
    })
  }

  async findAll(
    limit: number,
    idType?: number,
    idSubtype?: number,
    idUser?: number,
    sortField?: string,  // Campo por defecto para ordenar
    sortOrder?: 'ASC' | 'DESC'  // Dirección por defecto
  ): Promise<CityPointOfInterest[]> {
    const options: FindManyOptions<CityPointOfInterest> = {
      take: limit,
      relations: ['type', 'subtype'],  // Cargar relaciones
      where: {},
      order: {
        [sortField || 'name']: sortOrder || 'DESC',  // Agregar el ordenamiento dinámico
      },
    };

    // Filtros para relaciones
    if (idType) options.where['type'] = { id: idType };
    if (idSubtype) options.where['subtype'] = { id: idSubtype };
    if (idUser) options.where['idUser'] = idUser;

    let [cityPoints, total] = await this.cityPointOfInterestRepository.findAndCount(options);

    if (total === 0) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
    return cityPoints
  }

  async findAllWithDeleted() {
    let res = await this.cityPointOfInterestRepository.find(
      {
        withDeleted: true,
        relations: ['type', 'subtype'],  // Cargar relaciones
      },

    )
    return res
  }

  async findOne(
    id: number,
    idType?: number,
    idSubtype?: number,
    idUser?: number
  ): Promise<CityPointOfInterest> {
    const options: FindManyOptions<CityPointOfInterest> = {
      where: { id },
      relations: ['type', 'subtype'], // Cargar las relaciones
    };

    // Usar los nombres correctos de los campos en la tabla
    if (idType) options.where['typeId'] = idType;
    if (idSubtype) options.where['subtypeId'] = idSubtype;
    if (idUser) options.where['idUser'] = idUser;

    const cityPoint = await this.cityPointOfInterestRepository.findOne(options);

    if (!cityPoint) {
      throw new NotFoundException(`City point of interest with ID ${id} not found`);
    }

    return cityPoint;
  }

  async update(id: number, updateCityPointOfInterestDto: UpdateCityPointOfInterestDto, newImages?: string[]): Promise<CityPointOfInterest> {
    const cityPoint = await this.findOne(id);
  
    // Validar si se actualizó el nombre y si hay conflicto con otro punto de interés
    if (updateCityPointOfInterestDto.name && updateCityPointOfInterestDto.name !== cityPoint.name) {
      const existingCityPoint = await this.cityPointOfInterestRepository.findOne({ where: { name: updateCityPointOfInterestDto.name } });
      if (existingCityPoint) {
        throw new ConflictException(`A city point of interest with the name "${updateCityPointOfInterestDto.name}" already exists`);
      }
    }
  
    // Combinar imágenes nuevas con las existentes
    let updatedImages = cityPoint.images || [];
    
    if (newImages && newImages.length > 0) {
      updatedImages = [...updatedImages, ...newImages];
    }
  
    // Eliminar imágenes si se proporciona `imagesToRemove` en el DTO
    if (updateCityPointOfInterestDto.imagesToRemove) {
      updatedImages = updatedImages.filter(image => !updateCityPointOfInterestDto.imagesToRemove.includes(image));
  
      // Eliminar las imágenes físicamente del sistema de archivos
      for (const imageToRemove of updateCityPointOfInterestDto.imagesToRemove) {
        const imagePath = path.join(process.env.FILE_UPLOADS_DIR, imageToRemove);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
  
    // Actualizar la entidad
    const updatedData = {
      ...updateCityPointOfInterestDto,
      images: updatedImages  // Asignar las imágenes combinadas
    };
  
    await this.cityPointOfInterestRepository.update(id, updatedData);
    return this.cityPointOfInterestRepository.findOne({ where: { id } });
  }

  // async remove(id: number): Promise<void> {
  //   const result = await this.cityPointOfInterestRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`City point of interest with ID ${id} not found`);
  //   }
  // }

  async remove(id: number) {
    const eventToDelete = await this.cityPointOfInterestRepository.softDelete(id)
    if (eventToDelete.affected === 0) {
      throw new NotFoundException('Evento no encontrado');
    } else {
      return eventToDelete
    }
  }

  async restore(id: number) {
    const result = await this.cityPointOfInterestRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Punto de interes no encontrado');
    }

    return await this.cityPointOfInterestRepository.findOne({ where: { id: id } });
  }
}