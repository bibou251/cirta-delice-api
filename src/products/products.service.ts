import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  // ─────────────────────── PUBLIC ───────────────────────

  findAll(category?: string, search?: string): Promise<Product[]> {
    const where: any = { available: true };
    if (category) where.category = category;
    const query = this.repo.createQueryBuilder('product')
      .where('product.available = :available', { available: true });
    
    if (category) {
      query.andWhere('product.category = :category', { category });
    }
    if (search) {
      query.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    return query.orderBy('product.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Produit #${id} introuvable`);
    return product;
  }

  // ─────────────────────── ADMIN / ARTISAN ───────────────────────

  findAllAdmin(): Promise<Product[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({
      ...dto,
      stock: dto.stock ?? 0,
      available: true,
    });
    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async delete(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { message: `Produit #${id} supprimé avec succès` };
  }

  async toggleAvailability(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.available = !product.available;
    return this.repo.save(product);
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = Math.max(0, product.stock + quantity);
    return this.repo.save(product);
  }

  // ─────────────────────── ARTISAN SPECIFIC ───────────────────────

  findByArtisan(artisanId: string): Promise<Product[]> {
    return this.repo.find({
      where: { artisanId },
      order: { createdAt: 'DESC' },
    });
  }
}
