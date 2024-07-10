import { Module } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { EncryptController } from './encrypt.controller';

@Module({
  controllers: [EncryptController],
  providers: [EncryptService],
})
export class EncryptModule {}
