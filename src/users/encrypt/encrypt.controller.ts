import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { CreateEncryptDto } from './dto/create-encrypt.dto';
import { UpdateEncryptDto } from './dto/update-encrypt.dto';

@Controller('encrypt')
export class EncryptController {
  constructor(private readonly encryptService: EncryptService) {}

  @Post()
  create(@Body() createEncryptDto: CreateEncryptDto) {
    return this.encryptService.create(createEncryptDto);
  }

  @Get()
  findAll() {
    return this.encryptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encryptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEncryptDto: UpdateEncryptDto) {
    return this.encryptService.update(+id, updateEncryptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.encryptService.remove(+id);
  }
}
