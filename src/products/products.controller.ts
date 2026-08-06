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
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  // ─────────────────────── PUBLIC ROUTES ───────────────────────

  @Get()
  getAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, search);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ─────────────────────── ADMIN ROUTES ───────────────────────

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllAdmin() {
    return this.service.findAllAdmin();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ARTISAN)
  @Post()
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    // Un artisan peut seulement créer pour lui-même
    if (req.user.role === UserRole.ARTISAN) {
      dto.artisanId = req.user.userId.toString();
    }
    return this.service.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ARTISAN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ARTISAN)
  @Patch(':id/toggle')
  toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleAvailability(id);
  }

  // ─────────────────────── ARTISAN ROUTES ───────────────────────

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ARTISAN, UserRole.ADMIN)
  @Get('artisan/:artisanId')
  getByArtisan(@Param('artisanId') artisanId: string) {
    return this.service.findByArtisan(artisanId);
  }
}
