import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../common/decorators/user-role.enum";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    lastname: string;

    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsEmail()
    email: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];  // Esto hace que el campo roles sea opcional
}
