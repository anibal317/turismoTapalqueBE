import { IsNumber, IsString, IsOptional, IsEnum } from "class-validator"
import { Column } from "typeorm";
import { UserRole } from "../../common/decorators/user-role.enum";

export class CreateTypeEntityDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}