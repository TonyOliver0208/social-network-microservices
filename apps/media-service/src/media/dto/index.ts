import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class MediaQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['image', 'video', 'audio', 'document', 'other'])
  type?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
