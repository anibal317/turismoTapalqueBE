import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TypeEntityService } from './type-entity.service';
import { CreateTypeEntityDto } from './dto/create-type-entity.dto';
import { UpdateTypeEntityDto } from './dto/update-type-entity.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/user-role.enum';

@ApiTags('Type Entity')  // Agrupar este controlador bajo la etiqueta 'Type Entity' en Swagger
@Controller('type-entity')
@UseGuards(AuthGuard('jwt'))  // Proteger todos los endpoints con autenticación JWT
export class TypeEntityController {
  constructor(private readonly typeEntityService: TypeEntityService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo' })
  @ApiBody({
    type: CreateTypeEntityDto,
    description: 'Datos necesarios para crear un nuevo tipo',
    examples: {
      example1: {
        summary: 'Ejemplo de creación de tipo',
        value: {
          name: 'Tipo 1',
          description: 'Descripción del tipo 1'
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tipo creado correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación al crear tipo' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async create(@Body() createTypeEntityDto: CreateTypeEntityDto) {
    try {
      return await this.typeEntityService.create(createTypeEntityDto);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos obtenida correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findAll() {
    try {
      return await this.typeEntityService.findAll();
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo a obtener' })
  @ApiResponse({ status: 200, description: 'Tipo obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findOne(@Param('id') id: string) {
    try {
      return await this.typeEntityService.findOne(+id);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo a actualizar' })
  @ApiBody({
    type: UpdateTypeEntityDto,
    description: 'Datos para actualizar un tipo',
    examples: {
      example1: {
        summary: 'Ejemplo de actualización de tipo',
        value: {
          name: 'Nuevo nombre',
          description: 'Nueva descripción'
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Tipo actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación al actualizar tipo' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async update(@Param('id') id: string, @Body() updateTypeEntityDto: UpdateTypeEntityDto) {
    try {
      return await this.typeEntityService.update(+id, updateTypeEntityDto);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo a eliminar' })
  @ApiResponse({ status: 200, description: 'Tipo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async remove(@Param('id') id: string) {
    try {
      return await this.typeEntityService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
