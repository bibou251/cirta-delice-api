import { Controller, Get, Patch, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';

import { UserRole, User } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('admin/kyc')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class KycController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @Get('pending')
  async getPendingKyc() {
    return this.userRepo.find({
      where: [
        { kycLevel: 'pending' },
        { kycLevel: 'basic' }
      ],
      order: { createdAt: 'DESC' }
    });
  }

  @Patch(':id/approve')
  async approveKyc(@Param('id') id: number, @Body('level') level: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.update(id, { kycLevel: level || 'verified', isVerified: true });
    return { success: true, message: 'Dossier KYC validé avec succès' };
  }

  @Patch(':id/reject')
  async rejectKyc(@Param('id') id: number, @Body('reason') reason: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.update(id, { kycLevel: 'rejected', isVerified: false });
    return { success: true, reason: reason || 'Documents non conformes' };
  }
}
