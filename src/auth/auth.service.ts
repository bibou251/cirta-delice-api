import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(phone: string, password: string): Promise<any> {
    const existing = await this.usersRepository.findOne({ where: { phone } });
    if (existing) throw new ConflictException('Ce numéro est déjà utilisé');
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ phone, password: hashed });
    await this.usersRepository.save(user);
    return this.generateToken(user);
  }

  async login(phone: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { phone } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, phone: user.phone };
    return { access_token: this.jwtService.sign(payload) };
  }
}
