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

    async getStatisByMonth() {
        return {};
    }
}
