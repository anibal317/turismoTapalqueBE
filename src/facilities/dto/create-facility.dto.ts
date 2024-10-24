import { ArrayMinSize, ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateFacilityDto {
    @IsString()
    name:string

    @IsOptional()
    description:string

    @IsArray()
    @ArrayNotEmpty({ message: 'The subtypes array cannot be empty' })  // Verifica que no sea un array vacío
    @ArrayMinSize(1, { message: 'The subtypes array must contain at least one ID' })
    @IsInt({ each: true, message: 'Each subtype ID must be an integer' })
    subtypeIds: number[]; 
}
