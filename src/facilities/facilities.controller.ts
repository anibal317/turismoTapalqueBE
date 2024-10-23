import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new facility' })
  @ApiResponse({ status: 201, description: 'The facility has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'Facility Data',
    type: CreateFacilityDto,
    examples: {
      example1: {
        summary: 'Example Facility',
        value: {
          name: 'Swimming Pool',
          description: 'A large outdoor swimming pool',
        },
      },
    },
  })
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all facilities' })
  @ApiResponse({ status: 200, description: 'Return all facilities' })
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility by ID' })
  @ApiResponse({ status: 200, description: 'Return a facility by ID' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiParam({ name: 'id', description: 'ID of the facility', type: 'integer', example: 1 })
  findOne(@Param('id') id: number) {
    return this.facilitiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a facility' })
  @ApiResponse({ status: 200, description: 'The facility has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiBody({
    description: 'Updated Facility Data',
    type: UpdateFacilityDto,
    examples: {
      example1: {
        summary: 'Updated Example Facility',
        value: {
          name: 'Updated Swimming Pool',
          description: 'A newly renovated swimming pool',
        },
      },
    },
  })
  update(
    @Param('id') id: number,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ) {
    return this.facilitiesService.update(id, updateFacilityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a facility by ID' })
  @ApiResponse({ status: 200, description: 'The facility has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiParam({ name: 'id', description: 'ID of the facility', type: 'integer', example: 1 })
  remove(@Param('id') id: number) {
    return this.facilitiesService.remove(id);
  }
}
