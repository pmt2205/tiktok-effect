import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    updatePermissions(id: string, allowConnect: boolean): Promise<any>;
    remove(id: string): Promise<any>;
}
