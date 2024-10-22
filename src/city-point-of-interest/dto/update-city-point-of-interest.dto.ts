import { PartialType } from '@nestjs/mapped-types';
import { CreateCityPointOfInterestDto } from './create-city-point-of-interest.dto';

export class UpdateCityPointOfInterestDto extends PartialType(CreateCityPointOfInterestDto) {
    name?: string;
    contact?: string;
    address?: string;
    typeId?: number;
    subtypeId?: number;
    description?: string;
    startDate?: Date;
    state?: number;
    idUser?: number;

    // Este campo permitirá eliminar imágenes específicas
    imagesToRemove?: string[];
}
