import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FacilitiesService {

  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
  ) { }

  async create(createFacilityDto: CreateFacilityDto) {
    try {
      return await this.facilityRepository.save(createFacilityDto);
    } catch (error) {
      throw new HttpException(`Error creating Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      const types = await this.facilityRepository.find({ relations: ['users', 'subtype', 'cityPoints'] });
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

  async update(id: number, updateFacilityDto: UpdateFacilityDto) {
    if (!id || isNaN(id)) {
      throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
    }

    const typeEntity = await this.facilityRepository.findOne({ where: { id } });
    if (!typeEntity) {
      throw new HttpException('Type Entity not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.facilityRepository.update(id, updateFacilityDto);
      return this.findOne(id); // Devuelve la entidad actualizada
    } catch (error) {
      throw new HttpException(`Error updating Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      await this.facilityRepository.delete(id);
      return { message: 'Type Entity deleted successfully' };
    } catch (error) {
      throw new HttpException(`Error deleting Type Entity: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
