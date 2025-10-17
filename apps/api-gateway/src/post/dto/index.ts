import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Privacy {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export class CreatePostDto {
  @ApiProperty({ example: 'This is my first post!' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiProperty({ required: false, example: ['https://example.com/image1.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @ApiProperty({ required: false, example: Privacy.PUBLIC, enum: Privacy })
  @IsEnum(Privacy)
  @IsOptional()
  privacy?: Privacy;
}

export class UpdatePostDto {
  @ApiProperty({ required: false, example: 'Updated content' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ required: false, example: ['https://example.com/image1.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @ApiProperty({ required: false, example: Privacy.PUBLIC, enum: Privacy })
  @IsEnum(Privacy)
  @IsOptional()
  privacy?: Privacy;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post!' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiProperty({ required: false, example: 'parent-comment-uuid' })
  @IsString()
  @IsOptional()
  parentId?: string;
}
