import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UploadMediaDto {
  file: any;
}

export class MediaQueryDto {
  @IsOptional()
  @IsEnum(['image', 'video', 'audio', 'document', 'other'])
  type?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
