import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { TypeEntityService } from './type-entity.service';
import { CreateTypeEntityDto } from './dto/create-type-entity.dto';
import { UpdateTypeEntityDto } from './dto/update-type-entity.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/user-role.enum';

@Controller('type-entity')
@UseGuards(AuthGuard('jwt'))
export class TypeEntityController {
  constructor(private readonly typeEntityService: TypeEntityService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  async create(@Body() createTypeEntityDto: CreateTypeEntityDto) {
    try {
      return await this.typeEntityService.create(createTypeEntityDto);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findAll() {
    try {
      return await this.typeEntityService.findAll();
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findOne(@Param('id') id: string) {
    try {
      return await this.typeEntityService.findOne(+id);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async update(@Param('id') id: string, @Body() updateTypeEntityDto: UpdateTypeEntityDto) {
    try {
      return await this.typeEntityService.update(+id, updateTypeEntityDto);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)

  async remove(@Param('id') id: string) {
    try {
      return await this.typeEntityService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
