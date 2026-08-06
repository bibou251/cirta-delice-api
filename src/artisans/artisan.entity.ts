import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('artisans')
export class Artisan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameAr: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  specialtyAr: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('decimal', { precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userId: number; // Lien vers l'entité User si l'artisan a un compte

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
