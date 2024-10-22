import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcryptjs";
import { UserRole } from 'src/common/decorators/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

async create(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe por su nombre de usuario
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new BadRequestException('User ya existe');
    }

    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password.toString(), 10);

      // Si no se proporciona el array de roles, asignar el rol por defecto [UserRole.USER]
      const roles = createUserDto.roles && createUserDto.roles.length > 0 
        ? createUserDto.roles 
        : [UserRole.USER];  // Valor por defecto

      // Crear el nuevo usuario con los roles y la contraseña hasheada
      const newUser = {
        ...createUserDto,
        password: hashedPassword,
        roles,  // Asignar roles, ya sea los proporcionados o el valor por defecto
      };

      // Guardar el nuevo usuario en la base de datos
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
