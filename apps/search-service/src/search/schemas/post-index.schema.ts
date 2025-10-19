import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostIndexDocument = PostIndex & Document;

@Schema({ timestamps: true })
export class PostIndex {
  @Prop({ required: true, unique: true })
  postId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, text: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'], default: 'PUBLIC', index: true })
  privacy: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ type: Date, index: true })
  postedAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const PostIndexSchema = SchemaFactory.createForClass(PostIndex);

// Text search index
PostIndexSchema.index({ content: 'text', tags: 'text' });
PostIndexSchema.index({ userId: 1, postedAt: -1 });
PostIndexSchema.index({ privacy: 1, postedAt: -1 });
