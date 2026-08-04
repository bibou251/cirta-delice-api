import { ProductsService } from './products.service';
export declare class ProductsController {
    private service;
    constructor(service: ProductsService);
    getAll(): Promise<import("./product.entity").Product[]>;
    getOne(id: number): Promise<import("./product.entity").Product | null>;
}
