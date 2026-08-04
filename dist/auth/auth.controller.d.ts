import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: {
        phone: string;
        password: string;
    }): Promise<any>;
    login(body: {
        phone: string;
        password: string;
    }): Promise<any>;
}
