import { IsString, IsOptional, IsUrl, IsDateString, IsBoolean, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class FollowUserDto {
  @IsString()
  followerId: string;

  @IsString()
  followingId: string;
}

export class GetUserDto {
  @IsString()
  userId: string;
}
