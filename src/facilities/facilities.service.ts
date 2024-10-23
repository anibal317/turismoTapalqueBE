import { Injectable } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacilitiesService {
  constructor(

    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
  ) { }

  create(createFacilityDto: CreateFacilityDto) {
    return 'This action adds a new facility';
  }

  findAll() {
    return `This action returns all facilities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facility`;
  }

  update(id: number, updateFacilityDto: UpdateFacilityDto) {
    return `This action updates a #${id} facility`;
  }

  remove(id: number) {
    return `This action removes a #${id} facility`;
  }
}
