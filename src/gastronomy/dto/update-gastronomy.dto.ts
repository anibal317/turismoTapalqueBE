import { PartialType } from '@nestjs/mapped-types';
import { CreateGastronomyDto } from './create-gastronomy.dto';

export class UpdateGastronomyDto extends PartialType(CreateGastronomyDto) {}
