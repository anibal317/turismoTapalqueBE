import { Injectable } from '@nestjs/common';
import { CreateEncryptDto } from './dto/create-encrypt.dto';
import { UpdateEncryptDto } from './dto/update-encrypt.dto';

@Injectable()
export class EncryptService {
  create(createEncryptDto: CreateEncryptDto) {
    return 'This action adds a new encrypt';
  }

  findAll() {
    return `This action returns all encrypt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} encrypt`;
  }

  update(id: number, updateEncryptDto: UpdateEncryptDto) {
    return `This action updates a #${id} encrypt`;
  }

  remove(id: number) {
    return `This action removes a #${id} encrypt`;
  }
}
