import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
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

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true, default: REPAIR_REQUEST_STATUS.PENDING })
    status: string;

    /* RELATIONS */
    @ManyToOne(() => VehicleEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'id' })
    vehicle: Relation<VehicleEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_by_id', referencedColumnName: 'id' })
    repairBy: Relation<UserEntity>;

    @OneToMany(() => RepairDetailEntity, (entity) => entity.repairRequest, { createForeignKeyConstraints: false })
    details: Relation<RepairDetailEntity>[];

    @OneToMany(() => RepairProgressEntity, (entity) => entity.repairRequest, { createForeignKeyConstraints: false })
    progresses: Relation<RepairProgressEntity>[];
}
