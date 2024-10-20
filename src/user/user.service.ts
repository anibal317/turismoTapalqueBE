import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (user) throw new BadRequestException('User ya existe');

    try {
      const password = await bcrypt.hash(createUserDto.password.toString(), 10);
      const newUser = { ...createUserDto, password };
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new HttpException('User no guardado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<CreateUserDto> {
    return await this.userRepository.findOne({
      where: { id }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }


  // Método para encontrar un usuario por su correo
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Método para actualizar la contraseña del usuario
  async updatePassword(userId: number, newPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: newPassword });
  }

  async updateResetToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, { refreshToken });
}

async clearResetToken(userId: number) {
    await this.userRepository.update(userId, { refreshToken: null });
}
}
