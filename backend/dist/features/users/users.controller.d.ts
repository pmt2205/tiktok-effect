import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    updatePermissions(id: string, body: {
        allowConnect?: boolean;
        allowNpc?: boolean;
        allowedNpcCategories?: string[];
    }): Promise<any>;
    remove(id: string): Promise<any>;
}
