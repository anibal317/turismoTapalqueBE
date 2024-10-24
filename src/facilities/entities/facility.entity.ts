import { SubtypeEntity } from "src/subtype-entity/entities/subtype-entity.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('facilities')
export class Facility {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false, default: '-' })
    description: string

    // Relación muchos a muchos con SubtypeEntity
    @ManyToMany(() => SubtypeEntity, (subtype) => subtype.facilities)
    subtypes: SubtypeEntity[];
}
