import { IsBoolean, IsNumber } from "class-validator"

export abstract class CommonDto {
    @IsNumber()
    id: number

    @IsBoolean()
    state?: boolean

}