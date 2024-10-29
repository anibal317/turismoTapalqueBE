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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';


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
        typeId: { type: 'number', example: 1 },
        subtypeId: { type: 'number', example: 1 },
        idUser: { type: 'number', example: 1 },
        facilities: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
        startDate: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
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
          const uploadDir = process.env.FILE_UPLOADS_DIR || 'uploads';
          const cityPointsDir = join(uploadDir, 'citypoints');
          if (!existsSync(cityPointsDir)) {
            mkdirSync(cityPointsDir, { recursive: true });
          }
          cb(null, cityPointsDir);
        },
        filename: (req, file, cb) => {
          // const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;
          const uniqueFilename = `${file.originalname}`;
          cb(null, uniqueFilename);
        },
      }),
    })
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('typeId', ParseIntPipe) typeId: number,
    @Body('subtypeId', ParseIntPipe) subtypeId: number,
    @Body('idUser', ParseIntPipe) idUser: number,
    @Body('startDate') startDate: string,
    @Body() createCityPointDto: CreateCityPointOfInterestDto
  ) {
    console.log(typeId, subtypeId, idUser);
    // const uploadedFiles = files ? files.map(file => join('/', uploadDir, 'citypoints', file.filename)) : [];
    const uploadedFiles = files ? files.map(file => 'https://turismo-tapalque-be.vercel.app/files/citypoints/' + file.filename) : [];

    const facilities = createCityPointDto.facilities ? createCityPointDto.facilities.map(Number) : [];

    const cityPointDto: CreateCityPointOfInterestDto = {
      ...createCityPointDto,
      typeId,
      subtypeId,
      idUser,
      startDate: startDate ? new Date(startDate) : undefined,
      images: uploadedFiles,
      facilities,
    };

    return this.cityPointOfInterestService.create(cityPointDto);
  }

  @Get()
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        typeId: { type: 'number' },
        subtypeId: { type: 'number' },
        facilities: {
          type: 'array',
          items: { type: 'number' },
        },
        startDate: { type: 'string', format: 'date-time' },
        imagesToRemove: {
          type: 'array',
          items: { type: 'string' },
        },
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
          const uploadDir = process.env.FILE_UPLOADS_DIR || 'uploads';
          const cityPointsDir = join(uploadDir, 'citypoints');
          if (!existsSync(cityPointsDir)) {
            mkdirSync(cityPointsDir, { recursive: true });
          }
          cb(null, cityPointsDir);
        },
        filename: (req, file, cb) => {
          const uniqueFilename = `${file.originalname}`;
          cb(null, uniqueFilename);
        },
      }),
    })
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityPointDto: UpdateCityPointOfInterestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const uploadDir = process.env.FILE_UPLOADS_DIR || 'uploads';
    const uploadedFiles = files ? files.map(file => 'https://turismo-tapalque-be.vercel.app/files/citypoints/' + file.filename) : [];

    const cityPointDto = {
      ...updateCityPointDto,
      facilities: updateCityPointDto.facilities ? updateCityPointDto.facilities.map(Number) : undefined,
      imagesToRemove: Array.isArray(updateCityPointDto.imagesToRemove)
        ? updateCityPointDto.imagesToRemove
        : updateCityPointDto.imagesToRemove
          ? JSON.parse(updateCityPointDto.imagesToRemove as string)
          : undefined,
    };

    return this.cityPointOfInterestService.update(id, cityPointDto, uploadedFiles);
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