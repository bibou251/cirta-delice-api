import { Repository } from 'typeorm';
import { Product } from './product.entity';
export declare class ProductsService {
    private repo;
    constructor(repo: Repository<Product>);
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product | null>;
}
