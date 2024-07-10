import { Injectable } from '@nestjs/common';
import { CreateGastronomyDto } from './dto/create-gastronomy.dto';
import { UpdateGastronomyDto } from './dto/update-gastronomy.dto';

@Injectable()
export class GastronomyService {
  create(createGastronomyDto: CreateGastronomyDto) {
    return 'This action adds a new gastronomy';
  }

  findAll() {
    return `This action returns all gastronomy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gastronomy`;
  }

  update(id: number, updateGastronomyDto: UpdateGastronomyDto) {
    return `This action updates a #${id} gastronomy`;
  }

  remove(id: number) {
    return `This action removes a #${id} gastronomy`;
  }
}
