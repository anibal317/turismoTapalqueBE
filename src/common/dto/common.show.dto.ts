import { Exclude, Expose } from "class-transformer"
import { IsBoolean, IsNumber } from "class-validator"

export abstract class CommonShowDto {
    @IsNumber()
    id: number

    @IsBoolean()
    state?: boolean
}