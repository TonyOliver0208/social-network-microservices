import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength } from 'class-validator';

export enum Privacy {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsEnum(Privacy)
  @IsOptional()
  privacy?: Privacy;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsEnum(Privacy)
  @IsOptional()
  privacy?: Privacy;
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export * from '@app/common/dto';
