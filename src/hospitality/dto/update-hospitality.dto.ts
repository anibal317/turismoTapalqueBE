import { PartialType } from '@nestjs/mapped-types';
import { CreateHospitalityDto } from './create-hospitality.dto';

export class UpdateHospitalityDto extends PartialType(CreateHospitalityDto) {}
