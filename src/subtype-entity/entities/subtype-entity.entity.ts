import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeEntity } from "../../type-entity/entities/type-entity.entity";
import { CityPointOfInterest } from "../../city-point-of-interest/entities/city-point-of-interest.entity";
import { Facility } from "src/facilities/entities/facility.entity";

@Entity("subtype")
export class SubtypeEntity {
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:false})
    name:string

    @Column({nullable:true,default:"-"})
    description:string
    
    @ManyToOne(() => TypeEntity, (type) => type.id)
    type: TypeEntity

    @OneToMany(() => CityPointOfInterest, (cityPoint) => cityPoint.subtype)
    cityPoints: CityPointOfInterest[];

       // Relación muchos a muchos con Facility
       @ManyToMany(() => Facility, (facility) => facility.subtypes)
       @JoinTable({
           name: 'subtype_facilities',  // Nombre de la tabla intermedia
           joinColumn: { name: 'subtypeId', referencedColumnName: 'id' },
           inverseJoinColumn: { name: 'facilityId', referencedColumnName: 'id' },
       })
       facilities: Facility[];
}