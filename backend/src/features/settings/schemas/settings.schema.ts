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

  @Prop({ required: true, default: false })
  jarEnabled: boolean;

  @Prop({ required: true, default: 85 })
  jarX: number;

  @Prop({ required: true, default: 75 })
  jarY: number;

  @Prop({ required: true, default: 1.0 })
  jarScale: number;

  @Prop({ required: true, default: 'single' })
  liveMode: string;

  @Prop({ required: true, default: 'anime' })
  activeNpcCategory: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);


