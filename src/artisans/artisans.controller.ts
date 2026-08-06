import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArtisansService } from './artisans.service';
import { CreateArtisanDto, UpdateArtisanDto } from './artisan.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';

@Controller('artisans')
export class ArtisansController {
  constructor(private service: ArtisansService) {}

  // ─── PUBLIC ─────────────────────────────────────────────────────────

  @Get()
  getAll(@Query('city') city?: string) {
    return this.service.findAll(city);
  }

  // ─── ADMIN (routes statiques AVANT les routes paramétrées) ──────────

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllAdmin() {
    return this.service.findAllAdmin();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateArtisanDto) {
    return this.service.create(dto);
  }

  // ─── ROUTES PARAMÉTRÉES (toujours après les routes statiques) ───────

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArtisanDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }
}
