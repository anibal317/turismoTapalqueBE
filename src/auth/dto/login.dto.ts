import { Transform } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";

export class LoginDto {
    @IsString()
    @MinLength(6)
    @Transform(({ value }) => value.trim())
    username: string;
    
    @IsString()
    @MinLength(6)
    @Transform(({ value }) => value.trim())
    password: string;
}