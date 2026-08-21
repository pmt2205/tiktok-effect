import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Settings extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, default: 5 })
  duration: number;

  @Prop({ required: true, default: 2 })
  density: number;

  @Prop({ required: true, default: 'neon-pulse' })
  theme: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

@Schema()
export class Mapping extends Document {
  @Prop({ required: true, index: true })
  username: string;

  @Prop({ required: true })
  giftName: string;

  @Prop({ required: true })
  effect: string;

  @Prop({ required: false })
  videoUrl?: string;
}

export const MappingSchema = SchemaFactory.createForClass(Mapping);
MappingSchema.index({ username: 1, giftName: 1 }, { unique: true });

