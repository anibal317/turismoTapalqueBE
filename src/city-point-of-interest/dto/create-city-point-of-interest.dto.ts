import { Type } from "class-transformer"
import { IsArray, IsDate, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateCityPointOfInterestDto {
 
    @IsString()
    name:string

    @IsString()
    @IsOptional()
    contact?:string


    @IsString()
    @IsOptional()
    address?:string

    @IsNumber()
    typeId:number

    @IsNumber()
    subtypeId:number

    @IsString()
    @IsOptional()
    description?:string

    @IsDate()
    @Type(()=> Date)
    @IsOptional() 
    startDate?:Date

    @IsNumber()
    @IsOptional()
    state?:number

    @IsArray()
    @IsOptional()
    images?:string[]

    @IsNumber()
    idUser:number
}
