import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    register(phone: string, password: string): Promise<any>;
    login(phone: string, password: string): Promise<any>;
    private generateToken;
}
