import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NpcGift extends Document {
  @Prop({ required: true, index: true })
  username: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: Number, required: true, index: true })
  giftId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  coins: number;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: [String], required: true, default: [] })
  videos: string[];

  @Prop({ type: String, required: false, default: '' })
  activeVideo?: string;

  @Prop({ type: [String], required: true, default: [] })
  sounds: string[];

  @Prop({ type: String, required: false, default: '' })
  activeSound?: string;

  @Prop({ type: String, required: false, default: '' })
  menuText?: string;

  @Prop({ type: Boolean, required: true, default: true })
  menuShow: boolean;
}

export const NpcGiftSchema = SchemaFactory.createForClass(NpcGift);
NpcGiftSchema.index({ username: 1, category: 1, giftId: 1 }, { unique: true });
