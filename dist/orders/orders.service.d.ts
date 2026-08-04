import { Repository } from 'typeorm';
import { Order } from './order.entity';
export declare class OrdersService {
    private repo;
    constructor(repo: Repository<Order>);
    create(data: Partial<Order>): Promise<Order>;
    findByUser(userId: number): Promise<Order[]>;
    updateStatus(id: number, status: string, userId: number): Promise<Order>;
}
