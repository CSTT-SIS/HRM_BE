import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    findOneUserWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['role', 'avatar', 'account', 'department'],
        });
    };

    findOneWithRalations = ({ where, relations }: { where: any; relations: string[] }) => {
        const builder = this.createQueryBuilder('entity');
        if (where) {
            builder.where(where);
        }

        if (relations.length) {
            relations.forEach((relation) => {
                builder.leftJoinAndMapOne(`entity.${relation}`, `entity.${relation}`, relation, `${relation}.id = entity.${relation}Id`);
            });
        }

        return builder.getOne();
    };
}
