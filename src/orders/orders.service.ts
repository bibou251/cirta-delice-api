import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private repo: Repository<Order>,
  ) {}

  // ─────────────────────── CLIENT ───────────────────────

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }

  findByUser(userId: number): Promise<Order[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Commande #${id} introuvable`);
    if (userId !== undefined && order.userId !== userId) {
      throw new ForbiddenException('Accès refusé à cette commande');
    }
    return order;
  }

  // ─────────────────────── CLIENT: CANCEL ───────────────────────

  async cancelByUser(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Vous ne pouvez annuler que les commandes en attente ou confirmées',
      );
    }

    order.status = OrderStatus.CANCELLED;
    return this.repo.save(order);
  }

  // ─────────────────────── ADMIN ───────────────────────

  findAll(): Promise<Order[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Commande #${id} introuvable`);

    // Validation des transitions de statut
    const validTransitions: Record<string, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Transition invalide : ${order.status} → ${status}. Transitions autorisées: ${allowed.join(', ') || 'aucune'}`,
      );
    }

    order.status = status;
    return this.repo.save(order);
  }

  // ─────────────────────── STATS ───────────────────────

  async getStats(): Promise<any> {
    const orders = await this.repo.find();
    const total = orders.length;
    const pending = orders.filter((o) => o.status === OrderStatus.PENDING).length;
    const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const cancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;
    const revenue = orders
      .filter((o) => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + Number(o.total), 0);

    return { total, pending, delivered, cancelled, revenue };
  }
}
