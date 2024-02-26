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

    async getStatisBySex() {
        const result = this.query(`
            SELECT u.sex AS sex,
            COUNT(*) AS quantity
            FROM users u
            GROUP BY u.sex 
        `);

        return (await result).map((item) => ({
            sex: item.sex === 1 ? 'Nam' : 'Nữ',
            quantity: Number(item.quantity),
        }));
    }

    async getStatisBySeniority() {
        const result = this.query(`
            SELECT b.time1 AS seniority, 
            COUNT(*) AS quantity 
            FROM (SELECT a.user_id, 
                SUM(total_time) AS time1 
                FROM (SELECT contracts.user_id, 
                    IFNULL(YEAR(contracts.end_day) - YEAR(contracts.start_day), 
                    YEAR(CURDATE()) - YEAR(contracts.start_day)) AS total_time 
                    FROM contracts) AS a 
                    GROUP BY a.user_id) AS b 
                    GROUP BY b.time1;
        `);

        return (await result).map((item) => ({
            seniority: item.seniority,
            quantity: Number(item.quantity),
        }));
    }

    async getStatisByMonth() {
        return [];
    }
}
