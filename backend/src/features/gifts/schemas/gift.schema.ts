import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Gift extends Document {
  @Prop({ type: Number, required: true, unique: true, index: true })
  giftId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  coins: number;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: [String], required: true, default: [] })
  videos: string[];
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
