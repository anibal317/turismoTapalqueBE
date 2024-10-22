import { MovieService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
export declare class MovieController {
    private readonly movieService;
    constructor(movieService: MovieService);
    findAll(): Promise<Movie[]>;
    findOne(id: string): Promise<Movie>;
    create(createMovieDto: CreateMovieDto): Promise<Movie>;
    update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie>;
    remove(id: string): Promise<void>;
}
