import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, UseGuards, UseInterceptors, UploadedFiles, Res, ParseIntPipe } from '@nestjs/common';
import { CityPointOfInterestService } from './city-point-of-interest.service';
import { CreateCityPointOfInterestDto } from './dto/create-city-point-of-interest.dto';
import { UpdateCityPointOfInterestDto } from './dto/update-city-point-of-interest.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('City Points of Interest')
@ApiBearerAuth()
@Controller('city-point-of-interest')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CityPointOfInterestController {
  constructor(private readonly cityPointOfInterestService: CityPointOfInterestService) { }

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
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
        typeId: { type: 'string', example: 'EVENTS' },  // Cambiar a string para reflejar el nombre
        subtypeId: { type: 'string', example: 'SUBTYPE_NAME' }, // Cambiar a string para reflejar el nombre
        idUser: { type: 'number', example: 1 },
        facilities: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],  // Lista de IDs de facilities
        },
        startDate: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' }, // Agregar startDate
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
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('typeId', ParseIntPipe) typeId: string, // Cambiar a string
    @Body('subtypeId', ParseIntPipe) subtypeId: string, // Cambiar a string
    @Body('idUser', ParseIntPipe) idUser: number,
    @Body('startDate') startDate: string, // Agregar startDate
    @Body() createCityPointDto: CreateCityPointOfInterestDto
  ) {
    const uploadedFiles = files ? files.map(file => `/uploads/citypoints/${file.filename}`) : [];
  
    // Agregar facilities al DTO si existen
    const facilities = createCityPointDto.facilities || [];
  
  // Crea el DTO de ciudad
  const cityPointDto = {
    ...createCityPointDto,
    images: uploadedFiles.length > 0 ? uploadedFiles : createCityPointDto.images || [],
    facilities,  // Asegúrate de que facilities se asigna correctamente
  };
    return this.cityPointOfInterestService.create(cityPointDto);
  }
  

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all city points of interest' })
  @ApiResponse({ status: 200, description: 'Returns all city points of interest' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of results' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'idType', required: false, type: Number, description: 'Filter by type ID' })
  @ApiQuery({ name: 'idSubtype', required: false, type: Number, description: 'Filter by subtype ID' })
  @ApiQuery({ name: 'idUser', required: false, type: Number, description: 'Filter by user ID' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by (e.g., "type", "subtype", "name")' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  async findAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('idType') idType?: number,
    @Query('idSubtype') idSubtype?: number,
    @Query('idUser') idUser?: number,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    try {
      // Llamar al servicio para obtener los resultados
      const result = await this.cityPointOfInterestService.findAll(
        limit,
        page,
        idType,
        idSubtype,
        idUser,
        sortField,  // Este campo puede ser "name", "type" o "subtype"
        sortOrder   // El orden puede ser ASC o DESC
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Si es una excepción HTTP, propágala
      }
      // En caso de otro tipo de error, devolver un error interno del servidor
      throw new HttpException('Failed to retrieve city points of interest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific city point of interest' })
  @ApiResponse({ status: 200, description: 'Returns the specified city point of interest' })
  @ApiResponse({ status: 404, description: 'City point of interest not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the city point of interest' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.cityPointOfInterestService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve city point of interest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a city point of interest' })
  @ApiResponse({ status: 200, description: 'The city point of interest has been successfully updated' })
  @ApiResponse({ status: 404, description: 'City point of interest not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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
  async update(
    @Param('id') id: string,
    @Body() updateCityPointDto: UpdateCityPointOfInterestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const uploadedFiles = files ? files.map(file => `/uploads/citypoints/${file.filename}`) : [];
    const cityPointDto = {
      ...updateCityPointDto,
      images: uploadedFiles.length > 0 ? uploadedFiles : updateCityPointDto.images || []
    };
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