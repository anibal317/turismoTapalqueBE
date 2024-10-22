import { Module } from '@nestjs/common';
import {MovieService}from '../movies/movies.service'
import { MovieController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MoviesModule {}
