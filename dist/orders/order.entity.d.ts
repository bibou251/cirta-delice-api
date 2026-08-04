export declare class Order {
    id: number;
    userId: number;
    items: {
        productId: number;
        quantity: number;
    }[];
    total: number;
    status: string;
    deliveryAddress: string;
    createdAt: Date;
}
