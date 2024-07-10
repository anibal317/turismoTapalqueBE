import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HospitalityService } from './hospitality.service';
import { CreateHospitalityDto } from './dto/create-hospitality.dto';
import { UpdateHospitalityDto } from './dto/update-hospitality.dto';

@Controller('hospitality')
export class HospitalityController {
  constructor(private readonly hospitalityService: HospitalityService) {}

  @Post()
  create(@Body() createHospitalityDto: CreateHospitalityDto) {
    return this.hospitalityService.create(createHospitalityDto);
  }

  @Get()
  findAll() {
    return this.hospitalityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHospitalityDto: UpdateHospitalityDto) {
    return this.hospitalityService.update(+id, updateHospitalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hospitalityService.remove(+id);
  }
}
