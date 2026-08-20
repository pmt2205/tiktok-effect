import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<User>);
    findByUsername(username: string): Promise<User | null>;
    create(username: string, passwordHash: string, role: string): Promise<User>;
    findAll(): Promise<User[]>;
    remove(id: string): Promise<any>;
    updatePermissions(id: string, allowConnect: boolean): Promise<User | null>;
}
