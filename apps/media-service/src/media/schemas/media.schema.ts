import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  url: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ enum: ['image', 'video', 'audio', 'document', 'other'], default: 'other' })
  type: string;

  @Prop({ default: 'local' })
  storage: string; // 'local', 's3', 'cloudinary', etc.

  @Prop()
  metadata?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Indexes
MediaSchema.index({ userId: 1, createdAt: -1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ isActive: 1 });
