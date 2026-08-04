import { OrdersService } from './orders.service';
export declare class OrdersController {
    private service;
    constructor(service: OrdersService);
    create(body: any, req: any): Promise<import("./order.entity").Order>;
    getMyOrders(req: any): Promise<import("./order.entity").Order[]>;
    updateStatus(id: number, status: string, req: any): Promise<import("./order.entity").Order>;
}
