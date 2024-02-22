import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ORDER_STATUS, ORDER_TYPE, PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { CreateOrderItemDto } from '~/modules/order/dto/create-order-item.dto';
import { UpdateOrderItemDto } from '~/modules/order/dto/update-order-item.dto';
import { OrderEvent } from '~/modules/order/events/order.event';
import { UtilService } from '~/shared/services';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createOrderDto: CreateOrderDto) {
        const proposal = await this.isProposalValid(createOrderDto.proposalId, createOrderDto.providerId, createOrderDto.type);
        const entity = await this.database.order.save(this.database.order.create({ ...createOrderDto, createdById: UserStorage.getId() }));
        this.createOrderDetails(entity.id, proposal.id);

        // emit event to who can change status
        this.emitEvent('order.created', { id: entity.id });

        return entity;
    }

    async findAll(queries: FilterDto & { proposalId: string; providerId: string; status: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.order, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['proposalId', 'providerId', 'status']));
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('entity.provider', 'provider');
        builder.select(['entity', 'createdBy.id', 'createdBy.fullName', 'proposal.id', 'proposal.name', 'provider.id', 'provider.name']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        const builder = this.database.order.createQueryBuilder('order');
        builder.where({ id });

        builder.leftJoinAndSelect('order.proposal', 'proposal');
        builder.leftJoinAndSelect('order.provider', 'provider');
        builder.leftJoinAndSelect('order.createdBy', 'createdBy');
        builder.leftJoinAndSelect('order.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('order.items', 'items');
        builder.leftJoinAndSelect('items.product', 'product');
        builder.select([
            'order',
            'proposal.id',
            'proposal.name',
            'provider.id',
            'provider.name',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
            'items.id',
            'items.quantity',
            'items.price',
            'product.id',
            'product.name',
        ]);

        return builder.getOne();
    }

    async update(id: number, updateOrderDto: UpdateOrderDto) {
        await this.isStatusValid({ id, statuses: [ORDER_STATUS.PENDING] });
        await this.isProposalValid(updateOrderDto.proposalId, updateOrderDto.providerId, updateOrderDto.type);
        return this.database.order.update(id, updateOrderDto);
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED] });
        this.database.orderItem.delete({ orderId: id });
        return this.database.order.delete(id);
    }

    async getItems(queries: FilterDto & { orderId: number; productId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.orderItem, queries);
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.orderId = :id', { id: queries.orderId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'product.code', 'unit.id', 'unit.name']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    async addItem(id: number, item: CreateOrderItemDto) {
        await this.isStatusValid({ id, statuses: [ORDER_STATUS.PENDING] });
        // check if the product have been added to the proposal
        await this.isProductAddedToProposal(id, item.productId);
        return this.database.orderItem.save(item);
    }

    async updateItem(id: number, itemId: number, item: UpdateOrderItemDto) {
        await this.isStatusValid({ id, statuses: [ORDER_STATUS.PENDING] });
        // check if the product have been added to the proposal
        await this.isProductAddedToProposal(id, item.productId);
        return this.database.orderItem.update({ id: itemId, orderId: id }, item);
    }

    async removeItem(id: number, itemId: number) {
        await this.isStatusValid({ id, statuses: [ORDER_STATUS.PENDING] });
        return this.database.orderItem.delete({ id: itemId, orderId: id });
    }

    async placeOrder(id: number) {
        return this.updateStatus({ id, from: [ORDER_STATUS.PENDING], to: ORDER_STATUS.PLACED });
    }

    async shipping(id: number) {
        return this.updateStatus({ id, from: [ORDER_STATUS.PLACED], to: ORDER_STATUS.SHIPPING });
    }

    async receive(id: number) {
        return this.updateStatus({ id, from: [ORDER_STATUS.SHIPPING], to: ORDER_STATUS.RECEIVED });
    }

    async cancel(id: number) {
        return this.updateStatus({ id, from: [ORDER_STATUS.PENDING, ORDER_STATUS.PLACED], to: ORDER_STATUS.CANCELLED });
    }

    /**
     * The function `isProposalValid` retrieves a proposal from the database based on the provided proposal
     * ID, provider ID, and order type, and performs various checks and validations before returning
     * the proposal.
     * @param {number} proposalId - The ID of the proposal you want to retrieve.
     * @param {number} providerId - The `providerId` parameter is the ID of the provider associated
     * with the proposal.
     * @param {ORDER_TYPE} orderType - The orderType parameter is of type ORDER_TYPE, which is an enum
     * representing different types of orders.
     * @returns a Promise that resolves to a ProposalEntity.
     */
    private async isProposalValid(proposalId: number, providerId: number, orderType: ORDER_TYPE): Promise<ProposalEntity> {
        const proposal = await this.database.proposal.findOne({ where: { id: proposalId } });
        if (!proposal) throw new HttpException('Phiếu đề xuất không tồn tại', 400);
        if (proposal.status !== PROPOSAL_STATUS.APPROVED) throw new HttpException('Phiếu đề xuất chưa được duyệt', 400);
        if (proposal.type !== PROPOSAL_TYPE.PURCHASE) throw new HttpException('Phiếu đề xuất không phải là phiếu mua hàng', 400);
        if (orderType !== ORDER_TYPE.PURCHASE && proposal.type !== PROPOSAL_TYPE.PURCHASE)
            throw new HttpException('Loại đơn hàng không phải là đơn hàng mua hàng', 400);

        const count = await this.database.order.count({ where: { proposalId, providerId } });
        if (count > 0) throw new HttpException('Đơn hàng đã tồn tại', 400);

        return proposal;
    }

    /**
     * The function creates order item entities based on proposal details and saves them to the
     * database.
     * @param {number} orderId - The `orderId` parameter is the ID of the order for which the order
     * details are being created. It is a number that uniquely identifies the order.
     * @param {number} proposalId - The `proposalId` parameter is the ID of a proposal. It is used to
     * find the proposal details associated with the given proposal ID.
     * @returns a Promise that resolves to an array of OrderItemEntity objects.
     */
    private async createOrderDetails(orderId: number, proposalId: number): Promise<OrderItemEntity[]> {
        const proposalDetails = await this.database.proposalDetail.find({ where: { proposalId: proposalId }, relations: ['product'] });
        if (!proposalDetails || proposalDetails.length === 0) return [];

        const orderItemEntities = proposalDetails.map((proposalDetail) => {
            return this.database.orderItem.create({
                orderId,
                productId: proposalDetail.productId,
                quantity: proposalDetail.quantity,
                price: proposalDetail.price,
            });
        });

        return this.database.orderItem.save(orderItemEntities);
    }

    /**
     * The function checks if the given order status is valid by comparing it with a list of valid
     * statuses.
     * @param data - The `data` parameter is an object that contains two properties:
     * @returns an instance of the OrderEntity class.
     */
    private async isStatusValid(data: { id: number; statuses: any[] }): Promise<OrderEntity> {
        const order = await this.database.order.findOne({ where: { id: data.id } });
        if (!order) throw new HttpException('Đơn hàng không tồn tại', 400);
        if (!data.statuses.includes(order.status)) throw new HttpException('Trạng thái không hợp lệ', 400);
        return order;
    }

    /**
     * The function updates the status of an order and saves the progress tracking information.
     * @param data - The `data` parameter is an object that contains the following properties:
     * @returns the result of the update operation.
     */
    private async updateStatus(data: { id: number; from: ORDER_STATUS[]; to: ORDER_STATUS }) {
        await this.isStatusValid({ id: data.id, statuses: data.from });
        this.database.orderProgressTracking.save({ orderId: data.id, status: data.to, trackingDate: new Date() });
        // emit event
        this.emitEventByStatus(data.to, { id: data.id });
        return this.database.order.update(data.id, { status: data.to });
    }

    /**
     * The function checks if a product is added to a proposal and throws an exception if it is not.
     * @param {number} orderId - The orderId parameter is a number that represents the ID of the order.
     * @param {number} productId - The `productId` parameter is the ID of the product that needs to be
     * checked if it has been added to a proposal.
     */
    private async isProductAddedToProposal(orderId: number, productId: number) {
        const result = await this.database.order.isProductAddedToProposal(orderId, productId);
        if (!result) throw new HttpException('Sản phẩm chưa được thêm vào phiếu đề xuất', 400);
    }

    private emitEventByStatus(status: ORDER_STATUS, data: { id: number }) {
        switch (status) {
            case ORDER_STATUS.PLACED:
                this.emitEvent('order.placed', data);
                break;
            case ORDER_STATUS.SHIPPING:
                this.emitEvent('order.shipping', data);
                break;
            case ORDER_STATUS.RECEIVED:
                this.emitEvent('order.received', data);
                break;
            case ORDER_STATUS.CANCELLED:
                this.emitEvent('order.cancelled', data);
                break;
            default:
                break;
        }
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new OrderEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
