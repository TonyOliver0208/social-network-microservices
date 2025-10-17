import { IsString, IsOptional, IsUrl, IsDateString, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({ required: false, example: 'Software Developer & Tech Enthusiast' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({ required: false, example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiProperty({ required: false, example: 'https://johndoe.com' })
  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false, example: 'San Francisco, CA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ required: false, example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ required: false, example: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
