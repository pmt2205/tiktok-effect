import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ required: true, index: true })
  sender: string;

  @Prop({ required: true, index: true })
  receiver: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: false })
  read: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
