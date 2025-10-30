import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['PUBLIC', 'FRIENDS'])
  privacy?: string;
}

export class IndexPostDto {
  @IsString()
  postId: string;

  @IsString()
  userId: string;

  @IsString()
  content: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  mediaUrls?: string[];

  @IsOptional()
  privacy?: string;

  @IsOptional()
  postedAt?: Date;
}

export class IndexUserDto {
  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
