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
    const { name, typeId, subtypeId, idUser, images, facilities, contact, address, description, stars, places, startDate, state } = createCityPointOfInterestDto;

    // Validaciones de name y idUser
    if (!name || !idUser) {
      throw new HttpException('Name and IdUser are required', HttpStatus.BAD_REQUEST);
    }

    // Fetch type
    const type = await this.typeRepository.findOne({ where: { id: Number(typeId) } });
    if (!type) throw new NotFoundException(`Type with ID ${typeId} not found`);

    // Validaciones específicas para tipo 3
    if (type.id === 3) {
      if (!startDate) {
        throw new HttpException('StartDate is required for Type 3', HttpStatus.BAD_REQUEST);
      }
    }

    // Fetch subtype if provided and not type 3
    let subtype: SubtypeEntity | null = null;
    if (subtypeId && type.id !== 3) {
      subtype = await this.subtypeRepository.findOne({
        where: { id: Number(subtypeId) },
        relations: ['type']
      });
      if (!subtype) throw new NotFoundException(`Subtype with ID ${subtypeId} not found`);

      // Validación para asegurarse de que el subtype pertenezca al type
      if (subtype.type.id !== type.id) {
        throw new HttpException(`Subtype with ID ${subtypeId} does not belong to Type with ID ${typeId}`, HttpStatus.BAD_REQUEST);
      }
    }

    // Fetch facilities if provided and not type 3
    let facilitiesEntities: Facility[] = [];
    if (facilities && facilities.length > 0 && type.id !== 3) {
      facilitiesEntities = await this.facilityRepository.findByIds(facilities);
      if (facilitiesEntities.length !== facilities.length) {
        throw new NotFoundException(`One or more facilities not found`);
      }
    }

    // Crear el nuevo CityPointOfInterest
    const newCityPointOfInterest = new CityPointOfInterest();
    newCityPointOfInterest.name = name;
    newCityPointOfInterest.type = type;
    newCityPointOfInterest.typeId = type.id;
    newCityPointOfInterest.subtype = subtype;
    newCityPointOfInterest.subtypeId = subtype ? subtype.id : 1;
    newCityPointOfInterest.idUser = Number(idUser);
    newCityPointOfInterest.images = images || [];
    newCityPointOfInterest.facilities = facilitiesEntities;
    newCityPointOfInterest.contact = contact || '';
    newCityPointOfInterest.address = address || '';
    newCityPointOfInterest.description = description || '';
    newCityPointOfInterest.stars = stars ? Number(stars) : 0;
    newCityPointOfInterest.places = places ? Number(places) : 0;
    newCityPointOfInterest.startDate = startDate ? new Date(startDate) : null;
    newCityPointOfInterest.state = state ? Number(state) : 0;

    // Guardar el nuevo CityPointOfInterest
    try {
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
      relations: ['type', 'subtype', 'facilities'],
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

    // Manejo de las imágenes
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

    // Manejo de la relación de muchos a muchos con facilities
    let facilitiesEntities = cityPoint.facilities || [];
    if (updateCityPointOfInterestDto.facilities && updateCityPointOfInterestDto.facilities.length > 0) {
      // Verificar si las facilities existen en la base de datos
      facilitiesEntities = await this.facilityRepository.findByIds(updateCityPointOfInterestDto.facilities);

      if (facilitiesEntities.length !== updateCityPointOfInterestDto.facilities.length) {
        throw new NotFoundException(`One or more facilities not found`);
      }
    }

    // Actualizar los datos del CityPoint
    const updatedData = {
      ...updateCityPointOfInterestDto,
      images: updatedImages,
      facilities: facilitiesEntities // Actualizar la relación con las facilities
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