import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from "typeorm";
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

    // Relación con TypeEntity y especificación de la columna 'typeId'
    @ManyToOne(() => TypeEntity, (type) => type.cityPoints, { nullable: false })
    @JoinColumn({ name: 'typeId' })  // Esto creará la columna 'typeId'
    type: TypeEntity;

    @Column({ nullable: false })
    typeId: number;  // Especificamos explícitamente la columna 'typeId'

    // Relación con SubtypeEntity y especificación de la columna 'subtypeId'
    @ManyToOne(() => SubtypeEntity, (subtype) => subtype.cityPoints, { nullable: false })
    @JoinColumn({ name: 'subtypeId' })  // Esto creará la columna 'subtypeId'
    subtype: SubtypeEntity;

    @Column({ nullable: false })
    subtypeId: number;  // Especificamos explícitamente la columna 'subtypeId'

    @Column({ nullable: true, default: "-" })
    description: string;
    
    @Column({ nullable: true, default: "0" })
    stars: number;

    @Column({ nullable: true, default: "0" })
    places: number;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true, default: 0 })
    state: number;

    // @Column("text", { array: true, nullable: true })
    // images: string[]; 

    @Column("json", { nullable: true })
    images: string[];

    @Column({ nullable: false })
    idUser: number;

    @CreateDateColumn()
    createAt: Date;
    
    @UpdateDateColumn()
    updateAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}