import { IsNumber, IsString, IsOptional } from "class-validator"

export class RelTypeEntityDto {
    @IsNumber()
    id:number
}
