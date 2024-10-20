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
    private typeRepository: Repository<TypeEntity>,

    @InjectRepository(SubtypeEntity)
    private subtypeRepository: Repository<SubtypeEntity>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createCityPointOfInterestDto: CreateCityPointOfInterestDto): Promise<CityPointOfInterest> {
    const { name, typeId, subtypeId, idUser, images } = createCityPointOfInterestDto;

    if (!typeId || !subtypeId) {
      throw new HttpException('TypeId and SubtypeId are required', HttpStatus.BAD_REQUEST);
    }

    const imagesArray = Array.isArray(images) ? images : [];

    const newCityPoint = this.cityPointOfInterestRepository.create({
      ...createCityPointOfInterestDto,
      images: imagesArray,
    });

    return this.cityPointOfInterestRepository.save(newCityPoint);
  }

  async findDeleted(limit: number = 10, page: number = 1) {
    const [results, total] = await this.cityPointOfInterestRepository.findAndCount({
      where: { deletedAt: Not(IsNull()) },
      relations: ['type', 'subtype'],
      take: limit,
      skip: (page - 1) * limit,
      withDeleted: true
    });

    return { results, total, page, limit };
  }

  async findEvents(limit: number = 10, page: number = 1) {
    const [res, total] = await this.cityPointOfInterestRepository.findAndCount({
      where: {
        typeId: 3,
        state: Not(1)
      },
      order: {
        startDate: 'ASC'
      },
      take: limit,
      skip: (page - 1) * limit
    });

    return { results: res, total, page, limit };
  }

  async findAll(
    limitParam?: number,  // Cambiado a opcional
    pageParam?: number,   // Cambiado a opcional
    idType?: number,
    idSubtype?: number,
    idUser?: number,
    sortField?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<{ results: CityPointOfInterest[]; total: number; page: number; limit: number; links: { previous: string | null; next: string | null } }> {
  
    // Asignar valores por defecto si no se proporcionan
    const limit = limitParam ? Number(limitParam) : 10;
    const page = pageParam ? Number(pageParam) : 1;
  
    // Validar que limit y page sean números positivos
    if (isNaN(limit) || limit <= 0) {
      throw new HttpException('Invalid limit value', HttpStatus.BAD_REQUEST);
    }
  
    if (isNaN(page) || page <= 0) {
      throw new HttpException('Invalid page value', HttpStatus.BAD_REQUEST);
    }
  
    const options: FindManyOptions<CityPointOfInterest> = {
      take: limit,
      skip: (page - 1) * limit,
      relations: ['type', 'subtype'],
      where: {},
      order: {
        [sortField || 'name']: sortOrder || 'DESC',
      },
    };
  
    if (idType) options.where['type'] = { id: idType };
    if (idSubtype) options.where['subtype'] = { id: idSubtype };
    if (idUser) options.where['idUser'] = idUser;
  
    const [cityPoints, total] = await this.cityPointOfInterestRepository.findAndCount(options);
  
    if (total === 0) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  
    // Cálculo de enlaces para paginación
    const links = {
      previous: page > 1 ? `/city-point-of-interest?limit=${limit}&page=${page - 1}` : null,
      next: (page * limit) < total ? `/city-point-of-interest?limit=${limit}&page=${page + 1}` : null,
    };
  
    return { results: cityPoints, total, page, limit, links };
  }
  

  async findAllWithDeleted(limit: number = 10, page: number = 1) {
    const [res, total] = await this.cityPointOfInterestRepository.findAndCount({
      withDeleted: true,
      relations: ['type', 'subtype'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return { results: res, total, page, limit };
  }

  async findOne(
    id: number,
    idType?: number,
    idSubtype?: number,
    idUser?: number
  ): Promise<CityPointOfInterest> {
    const options: FindManyOptions<CityPointOfInterest> = {
      where: { id },
      relations: ['type', 'subtype'],
    };

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

    if (updateCityPointOfInterestDto.name && updateCityPointOfInterestDto.name !== cityPoint.name) {
      const existingCityPoint = await this.cityPointOfInterestRepository.findOne({ where: { name: updateCityPointOfInterestDto.name } });
      if (existingCityPoint) {
        throw new ConflictException(`A city point of interest with the name "${updateCityPointOfInterestDto.name}" already exists`);
      }
    }

    let updatedImages = cityPoint.images || [];

    if (newImages && newImages.length > 0) {
      updatedImages = [...updatedImages, ...newImages];
    }

    if (updateCityPointOfInterestDto.imagesToRemove) {
      updatedImages = updatedImages.filter(image => !updateCityPointOfInterestDto.imagesToRemove.includes(image));

      for (const imageToRemove of updateCityPointOfInterestDto.imagesToRemove) {
        const imagePath = path.join(process.env.FILE_UPLOADS_DIR, imageToRemove);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    const updatedData = {
      ...updateCityPointOfInterestDto,
      images: updatedImages
    };

    await this.cityPointOfInterestRepository.update(id, updatedData);
    return this.cityPointOfInterestRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const eventToDelete = await this.cityPointOfInterestRepository.softDelete(id);
    if (eventToDelete.affected === 0) {
      throw new NotFoundException('Evento no encontrado');
    } else {
      return eventToDelete;
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
