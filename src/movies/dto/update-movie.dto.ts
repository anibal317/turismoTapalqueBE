import { PartialType } from '@nestjs/swagger';
import { CreateMovieDto } from './create-movie.dto';
import { IsOptional } from 'class-validator';

export class UpdateMovieDto extends CreateMovieDto {
    @IsOptional()
    title: string;
  
    @IsOptional()
    director: string;
  
    @IsOptional()
    releaseYear: number;
  
    @IsOptional()
    description: string;
  
    @IsOptional()
    genre: string;
  }
