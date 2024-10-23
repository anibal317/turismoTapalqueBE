import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SubtypeEntity } from "../../subtype-entity/entities/subtype-entity.entity";
import { CityPointOfInterest } from "../../city-point-of-interest/entities/city-point-of-interest.entity";

@Entity('facilities')
export class Facility {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false})
    name:string

    @CreateDateColumn()
    createAt: Date;
    
    @UpdateDateColumn()
    updateAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // Relación many-to-many con SubtypeEntity
    @ManyToMany(() => SubtypeEntity, subtype => subtype.facilities, { cascade: true })
    @JoinTable({
        name: "facility_subtypes",  // Nombre de la tabla intermedia
        joinColumn: { name: "facilityId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "subtypeId", referencedColumnName: "id" }
    })
    subtypes: SubtypeEntity[];

    // Relación many-to-many con CityPointOfInterest
    @ManyToMany(() => CityPointOfInterest, cityPoint => cityPoint.facilities, { cascade: true })
    @JoinTable({
        name: "facility_citypoints",  // Nombre de la tabla intermedia
        joinColumn: { name: "facilityId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "cityPointId", referencedColumnName: "id" }
    })
    cityPoints: CityPointOfInterest[];

    
}
