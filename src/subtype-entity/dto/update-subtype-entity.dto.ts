import { PartialType } from '@nestjs/mapped-types';
import { CreateSubtypeEntityDto } from './create-subtype-entity.dto';

export class UpdateSubtypeEntityDto extends PartialType(CreateSubtypeEntityDto) {}
