import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserIndexDocument = UserIndex & Document;

@Schema({ timestamps: true })
export class UserIndex {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, index: true, text: true })
  username: string;

  @Prop({ text: true })
  fullName: string;

  @Prop({ text: true })
  bio: string;

  @Prop()
  avatar: string;

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ default: 0 })
  postsCount: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastActive: Date;
}

export const UserIndexSchema = SchemaFactory.createForClass(UserIndex);

// Text search index
UserIndexSchema.index({ username: 'text', fullName: 'text', bio: 'text' });
UserIndexSchema.index({ isActive: 1, lastActive: -1 });
