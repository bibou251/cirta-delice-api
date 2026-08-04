import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private repo: Repository<Order>,
  ) {}

  create(data: Partial<Order>): Promise<Order> {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }

  findByUser(userId: number): Promise<Order[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: number, status: string, userId: number): Promise<Order> {
    const order = await this.repo.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (status === 'cancelled' && order.status !== 'pending') {
      throw new Error('Seules les commandes en attente peuvent être annulées');
    }
    order.status = status;
    return this.repo.save(order);
  }
}
