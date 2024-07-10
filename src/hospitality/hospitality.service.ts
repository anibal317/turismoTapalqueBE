import { Injectable } from '@nestjs/common';
import { CreateHospitalityDto } from './dto/create-hospitality.dto';
import { UpdateHospitalityDto } from './dto/update-hospitality.dto';

@Injectable()
export class HospitalityService {
  create(createHospitalityDto: CreateHospitalityDto) {
    return 'This action adds a new hospitality';
  }

  findAll() {
    return `This action returns all hospitality`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hospitality`;
  }

  update(id: number, updateHospitalityDto: UpdateHospitalityDto) {
    return `This action updates a #${id} hospitality`;
  }

  remove(id: number) {
    return `This action removes a #${id} hospitality`;
  }
}
