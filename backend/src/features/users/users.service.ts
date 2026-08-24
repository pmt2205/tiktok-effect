import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(username: string, passwordHash: string, role: string): Promise<User> {
    const user = new this.userModel({
      username,
      passwordHash,
      role,
    });
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, '-passwordHash').exec(); // exclude passwordHash
  }

  async remove(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updatePermissions(id: string, permissions: { allowConnect?: boolean; allowNpc?: boolean; allowedNpcCategories?: string[] }): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, { $set: permissions }, { new: true }).select('-passwordHash').exec();
  }
}
