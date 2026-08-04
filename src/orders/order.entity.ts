import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('simple-json')
  items: { productId: number; quantity: number }[];

  @Column()
  total: number;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  deliveryAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
