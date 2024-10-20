import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { TypeEntity } from "../../type-entity/entities/type-entity.entity";
import { UserRole } from "../../common/decorators/user-role.enum";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    lastname: string

    @Column({ nullable: false })
    username: string

    @Column({ nullable: false })
    password: string

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ nullable: false })
    email: string

    // Nueva columna para almacenar roles
    @Column({
        type: 'enum',
        enum: UserRole,
        array: true,
        default: [UserRole.USER]  // Por defecto, los usuarios tienen el rol 'USER'
    })
    roles: UserRole[];

    @ManyToOne(() => TypeEntity, (type) => type.users)
    type: TypeEntity
}
