import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class KycRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected

  @Column('simple-array', { nullable: true })
  documents: string[]; // URLs des fichiers

  @Column({ nullable: true })
  adminComment: string;

  @CreateDateColumn()
  createdAt: Date;
}
