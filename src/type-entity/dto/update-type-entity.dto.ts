import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeEntityDto } from './create-type-entity.dto';

export class UpdateTypeEntityDto extends PartialType(CreateTypeEntityDto) {}
