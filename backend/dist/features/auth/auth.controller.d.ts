import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(username: string, password: string, role?: string): Promise<{
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
        };
    }>;
}
