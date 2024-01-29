import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'repair_details' })
export class RepairDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'repair_request_id', type: 'int', unsigned: true, nullable: true })
    repairRequestId: number;

    @Column({ name: 'broken_part', type: 'varchar', length: 255, nullable: true })
    brokenPart: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'replacement_part_id', type: 'int', unsigned: true, nullable: true })
    replacementPartId: number;

    @Column({ name: 'quantity', type: 'int', unsigned: true, nullable: true })
    quantity: number;
}
