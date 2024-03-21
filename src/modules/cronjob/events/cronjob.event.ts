export class CronJobEvent {
    receiverId: number;
    product: {
        id: number;
        name: string;
        expiredAt: string;
    };
    warehouse: {
        id: number;
        name: string;
    };
}
