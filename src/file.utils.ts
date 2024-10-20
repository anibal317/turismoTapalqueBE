import { BadRequestException } from "@nestjs/common"
import { Request } from "express"

export const fileNameEditor = (
    req: Request,
    file: any,
    callback: (error: any, filename) => void,
) => {
    const newFileName = file.originalname
    callback(null, newFileName)
}

export const imageFileFilter = (
    req: Request,
    file: any,
    callback: (error: any, valid: boolean) => void,
) => {
    if (!file.originalname ||
        !file.originalname.match(/\.(jpg|jpeg|png|gif|sgv|webp)$/)) {
        return callback(
            new BadRequestException('Arcihvo no permitido. Extensiones permitidas: jpg, jpeg, png, gif, sgv, webp'),
            false)
    }
    callback(null,true)
}