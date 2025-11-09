import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export enum Privacy {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsEnum(Privacy)
  @IsOptional()
  privacy?: Privacy;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
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
