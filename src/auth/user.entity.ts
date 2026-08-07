import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  CLIENT = 'client',
  ARTISAN = 'artisan',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', default: 'none' })
  kycLevel: string;

  @Column({ default: true })
  isActive: boolean;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
