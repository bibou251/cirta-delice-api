import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artisan } from './artisan.entity';
import { CreateArtisanDto, UpdateArtisanDto } from './artisan.dto';

@Injectable()
export class ArtisansService {
  constructor(
    @InjectRepository(Artisan)
    private repo: Repository<Artisan>,
  ) {}

  // ─── Public ─────────────────────────────────────────────────────────
  findAll(city?: string): Promise<Artisan[]> {
    const qb = this.repo.createQueryBuilder('artisan')
      .where('artisan.isActive = :active', { active: true })
      .orderBy('artisan.rating', 'DESC');

    if (city) {
      qb.andWhere('LOWER(artisan.city) = :city', { city: city.toLowerCase() });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Artisan> {
    const artisan = await this.repo.findOne({ where: { id } });
    if (!artisan) throw new NotFoundException(`Artisan #${id} introuvable`);
    return artisan;
  }

  // ─── Admin ──────────────────────────────────────────────────────────
  findAllAdmin(): Promise<Artisan[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateArtisanDto): Promise<Artisan> {
    const artisan = this.repo.create({ ...dto });
    return this.repo.save(artisan);
  }

  async update(id: string, dto: UpdateArtisanDto): Promise<Artisan> {
    const artisan = await this.findOne(id);
    Object.assign(artisan, dto);
    return this.repo.save(artisan);
  }

  async delete(id: string): Promise<{ message: string }> {
    const artisan = await this.findOne(id);
    await this.repo.remove(artisan);
    return { message: `Artisan #${id} supprimé avec succès` };
  }

  async toggleActive(id: string): Promise<Artisan> {
    const artisan = await this.findOne(id);
    artisan.isActive = !artisan.isActive;
    return this.repo.save(artisan);
  }

  async updateRating(id: string, newRating: number, reviewCount: number): Promise<Artisan> {
    const artisan = await this.findOne(id);
    artisan.rating = newRating;
    artisan.totalReviews = reviewCount;
    return this.repo.save(artisan);
  }

  // Seed de données initiales (premier démarrage)
  async seedIfEmpty(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    const seeds: Partial<Artisan>[] = [
      {
        name: 'Pâtisserie El Bey',
        nameAr: 'حلويات البايات',
        specialty: 'Gâteaux traditionnels',
        specialtyAr: 'الحلويات التقليدية',
        description: 'Spécialiste des gâteaux de mariage et plateaux constantinois depuis 3 générations.',
        city: 'Constantine',
        rating: 4.9,
        totalReviews: 127,
      },
      {
        name: 'Douceurs de Cirta',
        nameAr: 'حلويات سيرتا',
        specialty: 'Galettes & Kesra',
        specialtyAr: 'الغلات والكسرة',
        description: 'Artisane passionnée par les galettes maison et les pâtisseries à la semoule.',
        city: 'Constantine',
        rating: 4.8,
        totalReviews: 89,
      },
      {
        name: 'Le Palais du Makrout',
        nameAr: 'قصر المقروط',
        specialty: 'Plateaux mariage',
        specialtyAr: 'أطباق الزفاف',
        description: 'Confection de plateaux de mariage et cadeaux traditionnels sur mesure.',
        city: 'Constantine',
        rating: 4.7,
        totalReviews: 64,
      },
    ];

    await this.repo.save(seeds as Artisan[]);
  }
}
