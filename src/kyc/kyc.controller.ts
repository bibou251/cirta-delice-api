import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycRequest } from './kyc.entity';
import { User } from '../auth/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller('kyc')
export class KycController {
  constructor(
    @InjectRepository(KycRequest) private kycRepo: Repository<KycRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Client soumet des documents KYC
  @UseGuards(AuthGuard('jwt'))
  @Post('submit')
  @UseInterceptors(FilesInterceptor('documents', 3, {
    storage: diskStorage({
      destination: './uploads/kyc',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + extname(file.originalname));
      },
    }),
  }))
  async submitKyc(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    const userId = req.user.userId;
    const urls = files.map(f => `/uploads/kyc/${f.filename}`);
    const request = this.kycRepo.create({
      user: { id: userId },
      documents: urls,
      status: 'pending',
    });
    await this.kycRepo.save(request);
    return { message: 'Demande KYC soumise avec succès', status: 'pending' };
  }

  // Admin : lister les demandes en attente
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/pending')
  async getPending() {
    return this.kycRepo.find({ where: { status: 'pending' }, relations: ['user'] });
  }

  // Admin : approuver une demande
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/approve')
  async approve(@Param('id') id: number) {
    const kyc = await this.kycRepo.findOne({ where: { id }, relations: ['user'] });
    if (!kyc) throw new Error('Demande non trouvée');
    kyc.status = 'approved';
    await this.kycRepo.save(kyc);
    // Mettre à jour le statut KYC de l'utilisateur
    await this.userRepo.update(kyc.user.id, { kycLevel: 'verified' });
    return { message: 'KYC approuvé' };
  }

  // Admin : rejeter une demande
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/reject')
  async reject(@Param('id') id: number, @Body('comment') comment: string) {
    const kyc = await this.kycRepo.findOne({ where: { id }, relations: ['user'] });
    if (!kyc) throw new Error('Demande non trouvée');
    kyc.status = 'rejected';
    kyc.adminComment = comment;
    await this.kycRepo.save(kyc);
    await this.userRepo.update(kyc.user.id, { kycLevel: 'rejected' });
    return { message: 'KYC rejeté' };
  }

  // Client : vérifier son statut KYC
  @UseGuards(AuthGuard('jwt'))
  @Get('my-status')
  async getMyStatus(@Request() req: any) {
    const userId = req.user.userId;
    const kyc = await this.kycRepo.findOne({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    return kyc || { status: 'none' };
  }
}
