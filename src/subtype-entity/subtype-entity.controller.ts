import { Controller, Post, Body, Param, Get, Delete, Put, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubtypeEntityService } from './subtype-entity.service';
import { CreateSubtypeEntityDto } from './dto/create-subtype-entity.dto';
import { UpdateSubtypeEntityDto } from './dto/update-subtype-entity.dto';

@ApiTags('Subtypes')  // Agrupar este controlador bajo la etiqueta 'Subtypes' en Swagger
@Controller('subtypes')
export class SubtypeEntityController {
  constructor(private readonly subtypeService: SubtypeEntityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo subtipo' })
  @ApiBody({ 
    type: CreateSubtypeEntityDto,  // Definir el cuerpo del POST
    description: 'Datos para crear un subtipo',
    examples: {
      example1: {
        summary: 'Ejemplo de creación de subtipo',
        value: {
          name: 'Subtipo A',
          description: 'Descripción del Subtipo A',
          type: { id: 1 },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Subtipo creado correctamente' })
  @ApiResponse({ status: 400, description: 'Error al crear subtipo' })
  async create(@Body() createSubtypeEntityDto: CreateSubtypeEntityDto) {
    const { name, description, type } = createSubtypeEntityDto;
    return this.subtypeService.create(name, description, type.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los subtipos, con opciones de filtrado y ordenamiento' })
  @ApiQuery({ name: 'typeId', required: false, description: 'Filtrar por ID de tipo' })
  @ApiQuery({ name: 'sortField', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Dirección del ordenamiento' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados a devolver' })
  @ApiResponse({ status: 200, description: 'Lista de subtipos obtenida correctamente' })
  async findAll(
    @Query('typeId') typeId?: number, 
    @Query('sortField') sortField?: string,  
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',  
    @Query('limit') limit?: number
  ) {
    return this.subtypeService.findAll(typeId, sortField, sortOrder, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un subtipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del subtipo a obtener' })
  @ApiResponse({ status: 200, description: 'Subtipo obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Subtipo no encontrado' })
  async findOne(@Param('id') id: number) {
    return this.subtypeService.findOne(id);
  }

  @Put(':id')
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
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Subtipo actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Error al actualizar subtipo' })
  async update(@Param('id') id: number, @Body() updateSubtypeEntityDto: UpdateSubtypeEntityDto) {
    const { name, description, type } = updateSubtypeEntityDto;
    return this.subtypeService.update(id, name, description, type?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un subtipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del subtipo a eliminar' })
  @ApiResponse({ status: 200, description: 'Subtipo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Subtipo no encontrado' })
  async remove(@Param('id') id: number) {
    return this.subtypeService.remove(id);
  }
}
