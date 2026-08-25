import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(username: string, password: string, role: string): Promise<{
        userId: import("mongoose").Types.ObjectId;
        username: string;
        role: string;
    }>;
    login(username: string, password: string): Promise<{
        accessToken: string;
        user: {
            userId: import("mongoose").Types.ObjectId;
            username: string;
            role: string;
            allowConnect: boolean;
            allowNpc: boolean;
        };
    }>;
    loginWithGoogle(idToken: string): Promise<{
        accessToken: string;
        user: {
            userId: import("mongoose").Types.ObjectId;
            username: string;
            role: string;
            allowConnect: boolean;
            allowNpc: boolean;
        };
    }>;
}
