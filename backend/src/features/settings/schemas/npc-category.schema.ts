import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NpcCategory extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true })
  displayName: string;
}

export const NpcCategorySchema = SchemaFactory.createForClass(NpcCategory);
