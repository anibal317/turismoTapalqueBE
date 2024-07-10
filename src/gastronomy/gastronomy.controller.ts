import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GastronomyService } from './gastronomy.service';
import { CreateGastronomyDto } from './dto/create-gastronomy.dto';
import { UpdateGastronomyDto } from './dto/update-gastronomy.dto';

@Controller('gastronomy')
export class GastronomyController {
  constructor(private readonly gastronomyService: GastronomyService) {}

  @Post()
  create(@Body() createGastronomyDto: CreateGastronomyDto) {
    return this.gastronomyService.create(createGastronomyDto);
  }

  @Get()
  findAll() {
    return this.gastronomyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastronomyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastronomyDto: UpdateGastronomyDto) {
    return this.gastronomyService.update(+id, updateGastronomyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastronomyService.remove(+id);
  }
}
