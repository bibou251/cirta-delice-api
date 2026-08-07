import { Controller, Get, Patch, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';

import { UserRole } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';

@Controller('admin/disputes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class DisputesController {
  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}

  @Get()
  async getDisputes() {
    return this.orderRepo.find({ where: { status: OrderStatus.DISPUTED }, order: { createdAt: 'DESC' } });
  }

  @Patch(':id/resolve')
  async resolveDispute(@Param('id') id: number, @Body() body: { resolution: string; refund: boolean }) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = body.refund ? OrderStatus.CANCELLED : OrderStatus.DELIVERED;
    await this.orderRepo.save(order);
    return { success: true, resolution: body.resolution };
  }
}
