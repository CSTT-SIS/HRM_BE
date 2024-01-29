import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';
import { RepairProgressEntity } from '~/database/typeorm/entities/repairProgress.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { VehicleEntity } from '~/database/typeorm/entities/vehicle.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'repair_requests' })
export class RepairRequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'vehicle_id', type: 'int', unsigned: true, nullable: true })
    vehicleId: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'damage_level', type: 'varchar', length: 50, nullable: true })
    damageLevel: string;

    @Column({ name: 'repair_by_id', type: 'int', unsigned: true, nullable: true })
    repairById: number;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    /* RELATIONS */
    @ManyToOne(() => VehicleEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'id' })
    vehicle: Relation<VehicleEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_by_id', referencedColumnName: 'id' })
    repairBy: Relation<UserEntity>;

    @OneToMany(() => RepairDetailEntity, (detail) => detail, { createForeignKeyConstraints: false })
    details: Relation<RepairDetailEntity>[];

    @OneToMany(() => RepairProgressEntity, (progress) => progress, { createForeignKeyConstraints: false })
    progresses: Relation<RepairProgressEntity>[];
}
