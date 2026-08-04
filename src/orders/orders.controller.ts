import { Controller, Post, Body, UseGuards, Get, Request, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, userId: req.user.userId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getMyOrders(@Request() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body('status') status: string, @Request() req: any) {
    return this.service.updateStatus(id, status, req.user.userId);
  }
}
