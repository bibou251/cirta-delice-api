import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  // ─────────────────────── CLIENT ROUTES ───────────────────────

  /** Créer une commande (client authentifié) */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({
      ...body,
      userId: req.user.userId,
      userPhone: req.user.phone,
      userName: req.user.name,
    });
  }

  /** Mes commandes */
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  getMyOrders(@Request() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  /** Détail d'une commande */
  @UseGuards(AuthGuard('jwt'))
  @Get('my/:id')
  getMyOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.findOne(id, req.user.userId);
  }

  /** Annuler une commande (client) */
  @UseGuards(AuthGuard('jwt'))
  @Patch('my/:id/cancel')
  cancelOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.cancelByUser(id, req.user.userId);
  }

  // ─────────────────────── ADMIN ROUTES ───────────────────────

  /** Toutes les commandes (admin) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllOrders() {
    return this.service.findAll();
  }

  /** Statistiques commandes (admin) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  /** Changer le statut d'une commande (admin) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ARTISAN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.service.updateStatus(id, status);
  }
}
