import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { RegisterDto, LoginDto, UpdateProfileDto, UpdateRoleDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<any> {
    const existing = await this.usersRepository.findOne({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Ce numero est deja utilise');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = new User();
    user.phone = dto.phone;
    user.password = hashed;
    user.name = dto.name ?? null;
    user.email = dto.email ?? null;
    user.role = UserRole.CLIENT;

    await this.usersRepository.save(user);
    return this.generateToken(user);
  }

  async login(dto: LoginDto): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    if (!user.isActive) {
      throw new ForbiddenException('Compte desactive. Contactez l administrateur.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateToken(user);
  }

  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (emailExists) throw new ConflictException('Cet email est deja utilise');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    await this.usersRepository.save(user);

    const { password, ...profile } = user;
    return profile;
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map(({ password, ...u }) => u);
  }

  async toggleUserActive(userId: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.isActive = !user.isActive;
    await this.usersRepository.save(user);
    const { password, ...profile } = user;
    return profile;
  }

  async updateUserRole(userId: number, dto: UpdateRoleDto): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.role = dto.role;
    await this.usersRepository.save(user);
    const { password, ...profile } = user;
    return profile;
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }
}
