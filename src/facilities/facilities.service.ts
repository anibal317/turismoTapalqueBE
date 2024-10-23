import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityPointOfInterest } from 'src/city-point-of-interest/entities/city-point-of-interest.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(CityPointOfInterest)
    private readonly cityPointOfInterestRepository: Repository<CityPointOfInterest>,

    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
  ) {}

  async create(createFacilityDto: CreateFacilityDto): Promise<Facility> {
    const facility = this.facilityRepository.create(createFacilityDto);
    return this.facilityRepository.save(facility);
  }

  async findAll(): Promise<Facility[]> {
    return this.facilityRepository.find();
  }

  async findOne(id: number): Promise<Facility> {
    const facility = await this.facilityRepository.findOne({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }
    return facility;
  }

  async update(id: number, updateFacilityDto: UpdateFacilityDto): Promise<Facility> {
    const facility = await this.findOne(id);
    Object.assign(facility, updateFacilityDto);
    return this.facilityRepository.save(facility);
  }

  async remove(id: number): Promise<void> {
    const facility = await this.findOne(id);
    await this.facilityRepository.remove(facility);
  }
}
