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
    const { name, typeId, subtypeId, idUser, images, facilityIds } = createCityPointOfInterestDto;

    if (!typeId || !subtypeId || !idUser) {
      throw new HttpException('TypeId, SubtypeId, and IdUser are required', HttpStatus.BAD_REQUEST);
    }

    const type = await this.cityPointOfInterestRepository.query('SELECT id FROM type WHERE id = ?', [typeId]);
    if (!type.length) {
      throw new NotFoundException(`Type with ID ${typeId} not found`);
    }

    const subtype = await this.cityPointOfInterestRepository.query('SELECT id FROM subtype WHERE id = ?', [subtypeId]);
    if (!subtype.length) {
      throw new NotFoundException(`Subtype with ID ${subtypeId} not found`);
    }

    const user = await this.cityPointOfInterestRepository.query('SELECT id FROM user WHERE id = ?', [idUser]);
    if (!user.length) {
      throw new NotFoundException(`User with ID ${idUser} not found`);
    }

    // Verificar las facilities
    const facilities = await this.cityPointOfInterestRepository.query('SELECT id FROM facility WHERE id IN (?)', [facilityIds]);
    if (facilities.length !== facilityIds.length) {
      throw new NotFoundException('Some facilities not found');
    }

    const imagesArray = Array.isArray(images) ? images : [];
    const newCityPoint = this.cityPointOfInterestRepository.create({
      ...createCityPointOfInterestDto,
      images: imagesArray,
      facilities: facilities, // Relación con facilities
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
    limitParam?: number,  // Opcional
    pageParam?: number,   // Opcional
    idType?: number,
    idSubtype?: number,
    idUser?: number,
    sortField?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<{ results: CityPointOfInterest[]; total: number; page: number; limit: number; links: { previous: string | null; next: string | null } }> {

    const limit = limitParam ? Number(limitParam) : 10;
    const page = pageParam ? Number(pageParam) : 1;

    if (isNaN(limit) || limit <= 0) {
      throw new HttpException('Invalid limit value', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(page) || page <= 0) {
      throw new HttpException('Invalid page value', HttpStatus.BAD_REQUEST);
    }

    // Configurar las opciones de búsqueda
    const options: FindManyOptions<CityPointOfInterest> = {
      take: limit,
      skip: (page - 1) * limit,
      relations: ['type', 'subtype', 'facilities'],
      where: {},
      order: {
        [sortField || 'name']: sortOrder || 'DESC',
      },
    };

    // Condiciones opcionales
    if (idType) options.where['type'] = { id: idType };
    if (idSubtype) options.where['subtype'] = { id: idSubtype };
    if (idUser) options.where['idUser'] = idUser;

    const [cityPoints, total] = await this.cityPointOfInterestRepository.findAndCount(options);

    if (total === 0) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }

    const links = {
      previous: page > 1 ? `/city-point-of-interest?limit=${limit}&page=${page - 1}` : null,
      next: (page * limit) < total ? `/city-point-of-interest?limit=${limit}&page=${page + 1}` : null,
    };

    return { results: cityPoints, total, page, limit, links };
  }


  async findAllWithDeleted(limit: number = 10, page: number = 1) {
    const [res, total] = await this.cityPointOfInterestRepository.findAndCount({
      withDeleted: true,
      relations: ['type', 'subtype', 'facilities'],
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
  
    // Verificar las facilities actualizadas
    const { facilityIds } = updateCityPointOfInterestDto;
    const facilities = await this.cityPointOfInterestRepository.query('SELECT id FROM facility WHERE id IN (?)', [facilityIds]);
    if (facilities.length !== facilityIds.length) {
      throw new NotFoundException('Some facilities not found');
    }
  
    const updatedData = {
      ...updateCityPointOfInterestDto,
      images: updatedImages,
      facilities: facilities, // Relación con facilities
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
