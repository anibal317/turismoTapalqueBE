import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { UserRole } from "../../common/decorators/user-role.enum"

export class CreateUserDto {
    @IsString()
    name: string

    @IsString()
    lastname: string

    @IsString()
    username: string

    @IsString()
    password: string

    @IsEmail()
    email:string

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[]
}
