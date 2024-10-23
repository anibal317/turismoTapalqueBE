import { IsOptional, IsString } from "class-validator"

export class CreateFacilityDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

}
