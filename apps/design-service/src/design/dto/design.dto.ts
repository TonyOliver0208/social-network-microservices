import { IsString, IsOptional, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignDto {
  @ApiProperty({ description: 'Name of the design', default: 'Untitled Design' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Canvas data as JSON string' })
  @IsOptional()
  @IsString()
  canvasData?: string;

  @ApiPropertyOptional({ description: 'Width of the design canvas' })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the design canvas' })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'Design category/template type' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateDesignDto {
  @ApiPropertyOptional({ description: 'Design ID to update' })
  @IsOptional()
  @IsUUID()
  designId?: string;

  @ApiPropertyOptional({ description: 'Name of the design' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Canvas data as JSON string' })
  @IsOptional()
  @IsString()
  canvasData?: string;

  @ApiPropertyOptional({ description: 'Width of the design canvas' })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Height of the design canvas' })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'Design category/template type' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class DesignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  canvasData?: string;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
