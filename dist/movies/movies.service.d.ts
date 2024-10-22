import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
export declare class MovieService {
    private movieRepository;
    constructor(movieRepository: Repository<Movie>);
    findAll(): Promise<Movie[]>;
    findOne(id: number): Promise<Movie>;
    create(createMovieDto: CreateMovieDto): Promise<Movie>;
    update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie>;
    remove(id: number): Promise<void>;
}
