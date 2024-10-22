import { IsString, IsInt, IsNotEmpty, Min, Max, IsOptional, Length, IsNumber } from 'class-validator';

export class CreateMovieDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    title: string;
  
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    director: string;
  
    @IsInt()
    @Min(1888)
    @Max(new Date().getFullYear())
    releaseYear: number;
  
    @IsString()
    @IsNotEmpty()
    @Length(10, 1000)
    description: string;
  
    @IsString()
    @IsNotEmpty()
    genre: string;
  
    @IsNumber()
    @Min(0)
    @Max(10)
    @IsOptional()
    rating?: number;
  }
  