import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cloudinaryId: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  createdAt: Date;
}

export class AIImageRequestDto {
  @ApiProperty({ description: 'Text prompt for AI image generation' })
  prompt: string;

  @ApiPropertyOptional({ description: 'Negative prompt (what to avoid)' })
  negativePrompt?: string;

  @ApiPropertyOptional({ description: 'Art style' })
  style?: string;

  @ApiPropertyOptional({ description: 'AI model to use', default: 'dall-e-3' })
  model?: string;
}

export class AIImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  prompt: string;

  @ApiProperty()
  imageUrl: string;

  @ApiPropertyOptional()
  cloudinaryId?: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  createdAt: Date;
}
