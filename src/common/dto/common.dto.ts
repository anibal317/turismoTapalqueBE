import { Exclude, Expose } from "class-transformer"
import { IsBoolean, IsNumber } from "class-validator"

export abstract class CommonDto {
    @IsNumber()
    id: number

    @IsBoolean()
    state?: boolean

}