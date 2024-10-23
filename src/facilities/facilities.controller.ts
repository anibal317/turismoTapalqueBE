import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateSubtypeEntityDto } from 'src/subtype-entity/dto/update-subtype-entity.dto';
import { SubtypeEntityService } from 'src/subtype-entity/subtype-entity.service';

@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
    private readonly subtypeService: SubtypeEntityService
  ) {}

  @Post()
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(+id);
  }
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.facilitiesService.restore(+id);
  }

  @ApiOperation({ summary: 'Actualizar un subtipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del subtipo a actualizar' })
  @ApiBody({ 
    type: UpdateSubtypeEntityDto, 
    description: 'Datos para actualizar un subtipo',
    examples: {
      example1: {
        summary: 'Ejemplo de actualización de subtipo',
        value: {
          name: 'Subtipo B',
          description: 'Nueva descripción para el subtipo',
          type: { id: 2 },
          facilityIds: [1, 2],  // Añadimos un ejemplo de facilityIds
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Subtipo actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Error al actualizar subtipo' })
  async update(@Param('id') id: number, @Body() updateSubtypeEntityDto: UpdateSubtypeEntityDto) {
    const { name, description, type, facilityIds } = updateSubtypeEntityDto;
    return this.subtypeService.update(id, name, description, type?.id, facilityIds || []);  // Pasa los facilityIds, o un array vacío si no están presentes
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(+id);
  }
}
