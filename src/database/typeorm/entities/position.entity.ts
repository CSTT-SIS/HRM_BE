import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ContractEntity } from './contract.entity';

@Entity({ name: 'positions' })
export class PositionEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    /* RELATION */
    @OneToMany(() => ContractEntity, (entity: ContractEntity) => entity.position, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    contracts: Relation<ContractEntity>[];
}
