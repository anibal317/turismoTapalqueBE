import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { SubtypeEntity } from "../../subtype-entity/entities/subtype-entity.entity";
import { CityPointOfInterest } from "../../city-point-of-interest/entities/city-point-of-interest.entity";
import { UserRole } from "../../common/decorators/user-role.enum";

@Entity("type")
export class TypeEntity {
    @PrimaryGeneratedColumn()
    id:number
    
    @Column({nullable:false})
    name:string

    @Column({nullable:true})
    description:string

    @Column({
        type: 'enum',
        enum: UserRole,
        unique: true
    })
    role: UserRole

    @OneToMany(() => User, (user) => user.type)
    users: User[]

    @OneToMany(() => SubtypeEntity, (subtype) => subtype.type)
    subtype: SubtypeEntity[]

    @OneToMany(() => CityPointOfInterest, (cityPoint) => cityPoint.type)
    cityPoints: CityPointOfInterest[];
}