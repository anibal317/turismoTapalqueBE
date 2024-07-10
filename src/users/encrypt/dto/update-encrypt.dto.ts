import { PartialType } from '@nestjs/mapped-types';
import { CreateEncryptDto } from './create-encrypt.dto';

export class UpdateEncryptDto extends PartialType(CreateEncryptDto) {}
