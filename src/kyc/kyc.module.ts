import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { KycRequest } from './kyc.entity';
import { KycController } from './kyc.controller';
import { User } from '../auth/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KycRequest, User]),
    MulterModule.register({ dest: './uploads/kyc' }),
    AuthModule,
  ],
  controllers: [KycController],
})
export class KycModule {}
