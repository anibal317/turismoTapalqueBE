import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeEntity } from "../../type-entity/entities/type-entity.entity";
import { CityPointOfInterest } from "../../city-point-of-interest/entities/city-point-of-interest.entity";

@Entity("subtype")
export class SubtypeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: string

    @Column({ nullable: true, default: "-" })
    description: string

    @ManyToOne(() => TypeEntity, (type) => type.id)
    type: TypeEntity

    @OneToMany(() => CityPointOfInterest, (cityPoint) => cityPoint.subtype)
    cityPoints: CityPointOfInterest[];

}
