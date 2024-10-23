import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { TypeEntity } from "../../type-entity/entities/type-entity.entity";

export class CreateSubtypeEntityDto {
    @IsString()
    name:string

    @IsString()
    @IsOptional()
    description?:string 

    @IsNotEmpty()
    @Type(() => TypeEntity)
    type: TypeEntity;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })  // Cada elemento debe ser un número
    facilityIds?: number[];
}
