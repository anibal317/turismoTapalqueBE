import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, IsNull, Not } from 'typeorm';
import { CreateCityPointOfInterestDto } from './dto/create-city-point-of-interest.dto';
import { UpdateCityPointOfInterestDto } from './dto/update-city-point-of-interest.dto';
import { CityPointOfInterest } from './entities/city-point-of-interest.entity';
import * as path from 'path';
import * as fs from 'fs';
import { Facility } from 'src/facilities/entities/facility.entity';
import { TypeEntity } from 'src/type-entity/entities/type-entity.entity';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CityPointOfInterestService {
  constructor(
    @InjectRepository(CityPointOfInterest)
    private cityPointOfInterestRepository: Repository<CityPointOfInterest>,

    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,

    @InjectRepository(TypeEntity)
    private typeRepository: Repository<TypeEntity>,

    @InjectRepository(SubtypeEntity)
    private subtypeRepository: Repository<SubtypeEntity>,

  ) { }

  async create(createCityPointOfInterestDto: CreateCityPointOfInterestDto): Promise<CityPointOfInterest> {
    const {
      name,
      typeId,
      subtypeId,
      idUser,
      images,
      facilities,
      contact,
      address,
      description,
      stars,
      places,
      startDate,
      state,
    } = createCityPointOfInterestDto;

    if (!name || !idUser) {
      throw new HttpException('Name and IdUser are required', HttpStatus.BAD_REQUEST);
    }

    const type = await this.typeRepository.findOne({ where: { id: typeId } });
    if (!type) throw new NotFoundException(`Type with ID ${typeId} not found`);

    if (type.name === 'Eventos' && !startDate) {
      throw new HttpException('StartDate is required for Type Events', HttpStatus.BAD_REQUEST);
    }

    let facilitiesEntities: Facility[] = [];
    let subtype: SubtypeEntity | null = null;

    if (subtypeId) {
      subtype = await this.subtypeRepository.findOne({
        where: { id: subtypeId },
        relations: ['type', 'facilities'],
      });

      if (!subtype) {
        throw new NotFoundException(`Subtype with ID ${subtypeId} not found`);
      }

      if (!subtype.type || subtype.type.id !== type.id) {
        throw new HttpException(`Subtype with ID ${subtypeId} does not belong to Type with ID ${typeId}`, HttpStatus.BAD_REQUEST);
      }

      if (facilities && facilities.length > 0) {
        const validFacilities = await this.facilityRepository
          .createQueryBuilder('facility')
          .innerJoin('facility.subtypes', 'subtype')
          .where('subtype.id = :subtypeId', { subtypeId })
          .andWhere('facility.id IN (:...facilityIds)', { facilityIds: facilities })
          .getMany();

        if (validFacilities.length !== facilities.length) {
          const invalidFacilities = facilities.filter(facilityId => !validFacilities.map(f => f.id).includes(facilityId));
          throw new HttpException(`Invalid Facility IDs: ${invalidFacilities.join(', ')}`, HttpStatus.BAD_REQUEST);
        }

        facilitiesEntities = validFacilities;
      }
    }

    const newCityPointOfInterest = new CityPointOfInterest();
    newCityPointOfInterest.name = name;
    newCityPointOfInterest.type = type;
    newCityPointOfInterest.typeId = type.id;
    newCityPointOfInterest.subtype = subtype;

    try {
      newCityPointOfInterest.subtypeId = subtype ? subtype.id : null;
      newCityPointOfInterest.idUser = idUser;
      newCityPointOfInterest.images = images || [];
      newCityPointOfInterest.facilities = facilitiesEntities;
      newCityPointOfInterest.contact = contact || '';
      newCityPointOfInterest.address = address || '';
      newCityPointOfInterest.description = description || '';
      newCityPointOfInterest.stars = stars ? Number(stars) : 0;
      newCityPointOfInterest.places = places ? Number(places) : 0;
      newCityPointOfInterest.startDate = startDate ? new Date(startDate) : null;
      newCityPointOfInterest.state = state ? Number(state) : 0;

      return await this.cityPointOfInterestRepository.save(newCityPointOfInterest);
    } catch (error) {
      console.error('Error saving CityPointOfInterest:', error);
      throw new HttpException('Error saving CityPointOfInterest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findDeleted(limit: number = 10, page: number = 1) {
    const [results, total] = await this.cityPointOfInterestRepository.findAndCount({
      where: { deletedAt: Not(IsNull()) },
      relations: ['type', 'subtype', 'facilities'],
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
    limitParam?: number,
    pageParam?: number,
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
  
    // Crear el QueryBuilder
    const queryBuilder = this.cityPointOfInterestRepository.createQueryBuilder('cityPoint')
      .leftJoinAndSelect('cityPoint.type', 'type')
      .leftJoinAndSelect('cityPoint.subtype', 'subtype')
      .leftJoinAndSelect('cityPoint.facilities', 'facilities')
      .take(limit)
      .skip((page - 1) * limit);
  
    // Condiciones opcionales
    if (idType) queryBuilder.andWhere('type.id = :idType', { idType });
    if (idSubtype) queryBuilder.andWhere('subtype.id = :idSubtype', { idSubtype });
    if (idUser) queryBuilder.andWhere('cityPoint.idUser = :idUser', { idUser });
  
    // Configurar la lógica de orden basado en el campo de orden
    if (sortField === 'type') {
      queryBuilder.orderBy('type.name', sortOrder || 'DESC');
    } else if (sortField === 'subtype') {
      queryBuilder.orderBy('subtype.name', sortOrder || 'DESC');
    } else {
      queryBuilder.orderBy(`cityPoint.${sortField || 'name'}`, sortOrder || 'DESC');
    }
  
    // Ejecutar la consulta y obtener los resultados
    const [cityPoints, total] = await queryBuilder.getManyAndCount();
  
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

  async findOne(id: number): Promise<CityPointOfInterest> {
    const cityPoint = await this.cityPointOfInterestRepository.findOne({
      where: { id },
      relations: ['facilities'],
    });
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

    // Handle images
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

    // Handle facilities
    let facilitiesEntities = cityPoint.facilities || [];
    if (updateCityPointOfInterestDto.facilities && updateCityPointOfInterestDto.facilities.length > 0) {
      facilitiesEntities = await this.facilityRepository.findByIds(updateCityPointOfInterestDto.facilities);

      if (facilitiesEntities.length !== updateCityPointOfInterestDto.facilities.length) {
        throw new NotFoundException(`One or more facilities not found`);
      }
    }

    // Update CityPoint data
    const updatedData = {
      ...updateCityPointOfInterestDto,
      images: updatedImages,
      facilities: facilitiesEntities
    };

    await this.cityPointOfInterestRepository.save({
      id,
      ...updatedData,
    });

    return this.findOne(id);
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