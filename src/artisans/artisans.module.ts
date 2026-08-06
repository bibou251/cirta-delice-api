import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';
import { Artisan } from './artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artisan])],
  providers: [ArtisansService],
  controllers: [ArtisansController],
  exports: [ArtisansService],
})
export class ArtisansModule {}
