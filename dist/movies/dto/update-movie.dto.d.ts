import { CreateMovieDto } from './create-movie.dto';
export declare class UpdateMovieDto extends CreateMovieDto {
    title: string;
    director: string;
    releaseYear: number;
    description: string;
    genre: string;
}
