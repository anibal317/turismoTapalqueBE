import { IsString, IsOptional, IsEnum } from "class-validator"
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