/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StaffEntity } from '~/database/typeorm/entities/staff.entity';

@Injectable()
export class StaffRepository extends Repository<StaffEntity> {
    constructor(private dataSource: DataSource) {
        super(StaffEntity, dataSource.createEntityManager());
    }

    async getStatisBySex() {
        const result = this.query(`
            SELECT s.sex AS sex,
            COUNT(*) AS quantity
            FROM staffs s
            GROUP BY s.sex 
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
            FROM (SELECT a.staff_id, 
                SUM(total_time) AS time1 
                FROM (SELECT contracts.staff_id, 
                    IFNULL(YEAR(contracts.end_day) - YEAR(contracts.start_day), 
                    YEAR(CURDATE()) - YEAR(contracts.start_day)) AS total_time 
                    FROM contracts) AS a 
                    GROUP BY a.staff_id) AS b 
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
