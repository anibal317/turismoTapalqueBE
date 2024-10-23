import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('facilities')
export class Facility {
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:false})
    name:string

    @Column({nullable:false,default:'-'})
    description:string
}
