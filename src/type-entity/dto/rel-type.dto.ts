import { IsNumber } from "class-validator"

export class RelTypeEntityDto {
    @IsNumber()
    id:number
}
