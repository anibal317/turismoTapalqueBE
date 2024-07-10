import { DataSourceOptions } from "typeorm"
import 'dotenv/config'

export const dataSourceOptions: DataSourceOptions = {
    type: process.env.DB_TYPE as any,
    host: "ep-super-band-a40mespl-pooler.us-east-1.aws.neon.tech",
    port: Number(process.env.DB_PORT),
    username: "default",
    password: "MrSjeF9a1Vny",
    database: "verceldb",
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    bigNumberStrings: true,
    entities: ["dist/**/*.entity{.ts,.js}"]
}
// User,Member,MemberState

