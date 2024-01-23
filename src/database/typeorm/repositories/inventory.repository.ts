/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { DataSource, Repository } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';

@Injectable()
export class InventoryRepository extends Repository<InventoryEntity> {
    constructor(private dataSource: DataSource) {
        super(InventoryEntity, dataSource.createEntityManager());
    }

    async getQuantityByProductId(productId: number): Promise<number> {
        const result = await this.createQueryBuilder('inventory')
            .select('SUM(inventory.quantity)', 'quantity')
            .where('inventory.productId = :productId', { productId })
            .getRawOne();

        return Number(result.quantity) || 0;
    }

    async getQuantityByProductIds(productIds: number[], warehouseId?: number): Promise<{ productId: number; quantity: number }[]> {
        const builder = this.createQueryBuilder('inventory')
            .select('inventory.productId', 'productId')
            .addSelect('SUM(inventory.quantity)', 'quantity')
            .where('inventory.productId IN (:...productIds)', { productIds })
            .groupBy('inventory.productId');

        if (warehouseId) {
            builder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
        }

        const result = await builder.getRawMany();
        return result.map((item) => ({ ...item, quantity: Number(item.quantity) || 0 }));
    }

    async getQuantity(productId: number, warehouseId: number): Promise<number> {
        const result = await this.createQueryBuilder('inventory')
            .select('inventory.quantity', 'quantity')
            .where('inventory.productId = :productId', { productId })
            .andWhere('inventory.warehouseId = :warehouseId', { warehouseId })
            .getRawOne();

        return Number(result.quantity) || 0;
    }

    getOpeningQuantities(warehouseId: number, startDate: Date, endDate: Date): Promise<{ productId: number; current: string; opening: string }[]> {
        const builder = this.createQueryBuilder('entity')
            .leftJoin('entity.histories', 'histories', 'histories.createdAt BETWEEN :startDate AND :endDate', {
                startDate: moment(startDate).format('YYYY-MM-DD'),
                endDate: moment(endDate).format('YYYY-MM-DD'),
            })
            .where('entity.warehouseId = :warehouseId', { warehouseId })
            .select(['entity.productId as productId', 'entity.quantity as current', 'histories.from as opening'])
            .groupBy('entity.productId');

        return builder.getRawMany();
    }

    getOpeningQuantity(warehouseId: number, productId: number, startDate: Date, endDate: Date): Promise<{ current: string; opening: string }> {
        const builder = this.createQueryBuilder('entity')
            .leftJoin('entity.histories', 'histories', 'histories.createdAt BETWEEN :startDate AND :endDate', {
                startDate: moment(startDate).format('YYYY-MM-DD'),
                endDate: moment(endDate).format('YYYY-MM-DD'),
            })
            .where('entity.warehouseId = :warehouseId', { warehouseId })
            .andWhere('entity.productId = :productId', { productId })
            .select(['entity.quantity as current', 'histories.from as opening']);

        return builder.getRawOne();
    }
}
