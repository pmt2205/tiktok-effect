import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({ required: true, enum: ['free', 'pro', 'promax'], default: 'free', index: true })
  subscriptionTier: 'free' | 'pro' | 'promax';

  @Prop({ type: Date, required: false, default: null })
  subscriptionStartedAt?: Date | null;

  @Prop({ type: Date, required: false, default: null, index: true })
  subscriptionExpiresAt?: Date | null;

  @Prop({ required: false, default: false })
  allowConnect: boolean;

  @Prop({ required: false, default: false })
  allowNpc: boolean;

  @Prop({ type: [String], required: false, default: [] })
  allowedNpcCategories: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
