import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TypeEntity } from "../../type-entity/entities/type-entity.entity";
import { SubtypeEntity } from "../../subtype-entity/entities/subtype-entity.entity";

@Entity("citypoints")
export class CityPointOfInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    contact: string;

    @Column({ nullable: true })
    address: string;

    @ManyToOne(() => TypeEntity, (type) => type.cityPoints, { nullable: false })
    type: TypeEntity;

    @ManyToOne(() => SubtypeEntity, (subtype) => subtype.cityPoints, { nullable: false })
    subtype: SubtypeEntity;

    @Column({ nullable: true, default: "-" })
    description: string;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true, default: 0 })
    state: number;

    @Column("text", { array: true, nullable: true })
    images: string[];

    @Column({ nullable: false })
    idUser: number;

    @CreateDateColumn()
    createAt: Date
    
    @UpdateDateColumn()
    updateAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
