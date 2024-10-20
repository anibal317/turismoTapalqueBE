import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
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
}