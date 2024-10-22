import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

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

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsString()
  contact?: string

  @IsString()
  @IsOptional()
  address?: string
}
