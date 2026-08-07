import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycController } from './kyc.controller';
import { DisputesController } from './disputes.controller';
import { User } from '../auth/user.entity';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [KycController, DisputesController],
})
export class AdminModule {}
