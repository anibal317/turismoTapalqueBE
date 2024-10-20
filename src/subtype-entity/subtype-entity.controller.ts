import { Controller, Post, Body, Param, Get, Delete, Put, Query, HttpStatus } from '@nestjs/common';
import { SubtypeEntityService } from './subtype-entity.service';
import { CreateSubtypeEntityDto } from './dto/create-subtype-entity.dto';
import { UpdateSubtypeEntityDto } from './dto/update-subtype-entity.dto';

@Controller('subtypes')
export class SubtypeEntityController {
  constructor(private readonly subtypeService: SubtypeEntityService) {}

  @Post()
  async create(@Body() createSubtypeEntityDto: CreateSubtypeEntityDto) {
    const { name, description, type } = createSubtypeEntityDto;
    return this.subtypeService.create(name, description, type.id);
  }

  @Get()
  async findAll(
    @Query('typeId') typeId?: number, 
    @Query('sortField') sortField?: string,  // Campo a ordenar
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',  // Dirección del ordenamiento
    @Query('limit') limit?: number
  ) {
    return this.subtypeService.findAll(typeId, sortField,sortOrder, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.subtypeService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateSubtypeEntityDto: UpdateSubtypeEntityDto) {
    const { name, description, type } = updateSubtypeEntityDto;
    return this.subtypeService.update(id, name, description, type?.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.subtypeService.remove(id);
  }
}
