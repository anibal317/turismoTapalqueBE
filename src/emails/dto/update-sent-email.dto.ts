import { PartialType } from '@nestjs/swagger';
import { SendEmailDto } from './send-email.dto';

export class UpdateSentEmailDto extends PartialType(SendEmailDto) {}
