import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty, IsDate, ArrayNotEmpty } from 'class-validator';

export class CreateCityPointOfInterestDto {
  @IsString()
  name: string;

  @IsString( )
  @IsNotEmpty()
  typeId: number;

  @IsString()
  @IsNotEmpty()
  subtypeId: number;

  @IsString()
  @IsNotEmpty()
  idUser: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  stars: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  places: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsString()
  contact?: string

  @IsString()
  @IsOptional()
  address?: string
 
  @IsString()
  @IsOptional()
  description?: string
 
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })  // Asegurarse de que cada elemento del array sea un número
  @IsOptional()
  facilities?: number[];  // IDs de instalaciones (facilities)
}