import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateFacilityDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    subtypeIds: number[]; 
}
