import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserBasicInfoDto, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('User')  // Agrupar este controlador bajo la etiqueta 'User' en Swagger
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Controller('user')
// @UseGuards(AuthGuard('jwt'))  // Puedes habilitar la autenticación según sea necesario
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos necesarios para crear un nuevo usuario',
    examples: {
      example1: {
        summary: 'Ejemplo de creación de usuario',
        value: {
          username: 'usuario1',
          password: 'password123',
          email: 'user1@example.com',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación al crear usuario' })
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a obtener' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('/profile/:id')
  @ApiOperation({ summary: 'Obtener el perfil de un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del perfil del usuario a obtener' })
  @ApiResponse({ status: 200, description: 'Perfil de usuario obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @Roles(UserRole.ADMIN)
  findOneProfile(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos para actualizar un usuario',
    examples: {
      example1: {
        summary: 'Ejemplo de actualización de usuario',
        value: {
          username: 'usuario_modificado',
          email: 'usuario_modificado@example.com',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación al actualizar usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Actualizar la información básica de un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario para actualizar su información básica' })
  @Roles(UserRole.ADMIN)
  @ApiBody({
    type: UpdateUserBasicInfoDto,
    description: 'Datos para actualizar la información básica de un usuario',
    examples: {
      example1: {
        summary: 'Ejemplo de actualización básica de usuario',
        value: {
          username: 'usuario_modificado',
          email: 'usuario_modificado@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Información básica del usuario actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación al actualizar la información básica del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  updatebasicdata(@Param('id') id: string, @Body() updateUserDto: UpdateUserBasicInfoDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por su ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
