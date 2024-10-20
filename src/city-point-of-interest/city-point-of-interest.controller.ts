import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CityPointOfInterestService } from './city-point-of-interest.service';
import { UpdateCityPointOfInterestDto } from './dto/update-city-point-of-interest.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { CreateCityPointOfInterestDto } from './dto/create-city-point-of-interest.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('City Points of Interest')
@ApiBearerAuth()
@Controller('city-point-of-interest')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CityPointOfInterestController {
  constructor(private readonly cityPointOfInterestService: CityPointOfInterestService) { }

  @Get('all')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all city points of interest including deleted ones' })
  @ApiResponse({ status: 200, description: 'Returns all city points of interest including deleted ones' })
  async findAllWithDeleted() {
    return await this.cityPointOfInterestService.findAllWithDeleted()
  }

  @Get('events')
  async findEvents() {
    return await this.cityPointOfInterestService.findEvents()
  }

  @Get('deleted')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all deleted city points of interest' })
  @ApiResponse({ status: 200, description: 'Returns all deleted city points of interest' })
  async findDeleted() {
    return await this.cityPointOfInterestService.findDeleted()
  }

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.env.FILE_UPLOADS_DIR, 'citypoints');
          fs.promises.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err, uploadPath));
        },
        filename: (req, file, cb) => {
          const customFilename = file.originalname;
          const extension = path.extname(file.originalname);
          const fullFilename = `${customFilename}${extension}`;
          cb(null, fullFilename);
        },
      }),
    })
  )
  @ApiOperation({ summary: 'Create a new city point of interest' })
  @ApiResponse({ status: 201, description: 'The city point of interest has been successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Eiffel Tower' },
        description: { type: 'string', example: 'Famous iron lattice tower in Paris' },
        latitude: { type: 'number', example: 48.8584 },
        longitude: { type: 'number', example: 2.2945 },
        idType: { type: 'number', example: 1 },
        idSubtype: { type: 'number', example: 2 },
        idUser: { type: 'number', example: 1 },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createCityPointDto: CreateCityPointOfInterestDto
  ) {
    // Verifica si hay archivos subidos
    const uploadedFiles = files ? files.map(file => `/uploads/citypoints/${file.filename}`) : [];

    // Paso 2: Pasar las imágenes al DTO junto con los demás datos
    const cityPointDto = {
      ...createCityPointDto,
      images: uploadedFiles.length > 0 ? uploadedFiles : createCityPointDto.images || []
    };

    // Paso 3: Crear el CityPointOfInterest
    return this.cityPointOfInterestService.create(cityPointDto);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all city points of interest' })
  @ApiResponse({ status: 200, description: 'Returns all city points of interest' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of results' })
  @ApiQuery({ name: 'idType', required: false, type: Number, description: 'Filter by type ID' })
  @ApiQuery({ name: 'idSubtype', required: false, type: Number, description: 'Filter by subtype ID' })
  @ApiQuery({ name: 'idUser', required: false, type: Number, description: 'Filter by user ID' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  async findAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('idType') idType?: number,
    @Query('idSubtype') idSubtype?: number,
    @Query('idUser') idUser?: number,
    @Query('sortField') sortField?: string,  // Campo a ordenar
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'  // Dirección del ordenamiento
  ) {
    try {
      let res = await this.cityPointOfInterestService.findAll(limit,page,  idType, idSubtype, idUser, sortField, sortOrder);
      return res;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
console.log(error);

      throw new HttpException('Failed to retrieve city points of interest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific city point of interest' })
  @ApiResponse({ status: 200, description: 'Returns the specified city point of interest' })
  @ApiResponse({ status: 404, description: 'City point of interest not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the city point of interest' })
  async findOne(
    @Param('id') id: string,
    @Query('idType') idType?: number,
    @Query('idSubtype') idSubtype?: number,
    @Query('idUser') idUser?: number
  ) {
    try {
      let res = await this.cityPointOfInterestService.findOne(+id);
      return res;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve city point of interest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {  // Subir hasta 10 archivos con el nombre `images`
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.env.FILE_UPLOADS_DIR, 'citypoints');
          fs.promises.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err, uploadPath));
        },
        filename: (req, file, cb) => {
          const customFilename = file.originalname;
          const extension = path.extname(file.originalname);
          const fullFilename = `${customFilename}${extension}`;
          cb(null, fullFilename);
        },
      }),
    })
  )
  @ApiOperation({ summary: 'Update a city point of interest' })
  @ApiResponse({ status: 200, description: 'The city point of interest has been successfully updated' })
  @ApiResponse({ status: 404, description: 'City point of interest not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('id') id: string,
    @Body() updateCityPointDto: UpdateCityPointOfInterestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    // Verifica si hay archivos subidos
    const uploadedFiles = files ? files.map(file => `/uploads/citypoints/${file.filename}`) : [];

    // Paso 2: Combinar los nuevos datos con los existentes
    const cityPointDto = {
      ...updateCityPointDto,
      images: uploadedFiles.length > 0 ? uploadedFiles : updateCityPointDto.images || []
    };

    // Paso 3: Actualizar el CityPointOfInterest
    return this.cityPointOfInterestService.update(+id, cityPointDto);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a city point of interest' })
  @ApiResponse({ status: 200, description: 'The city point of interest has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'City point of interest not found' })
  async remove(@Param('id') id: string) {
    return await this.cityPointOfInterestService.remove(+id);
  }
}
