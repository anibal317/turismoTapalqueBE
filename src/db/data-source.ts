import { DataSource, DataSourceOptions } from "typeorm"
import { User } from "src/users/entities/user.entity";
import { Member } from "src/members/entities/member.entity";
import { MemberState } from "src/member-state/entities/member-state.entity";
import 'dotenv/config'

export const dataSourceOptions: DataSourceOptions = {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    bigNumberStrings: true,
    entities: ["./projects/**/entities/*.ts"],
    migrations: ["./projects/**/migrations/**.js"],
} 

const dataSource = new DataSource(dataSourceOptions)
export default dataSource;