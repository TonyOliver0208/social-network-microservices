import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DesignService } from './design.service';
import { CreateDesignDto, UpdateDesignDto, DesignResponseDto } from './dto/design.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('designs')
@ApiBearerAuth()
@Controller('designs')
@UseGuards(JwtAuthGuard)
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  @Get()
  @ApiOperation({ summary: 'Get all designs for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all designs',
    type: [DesignResponseDto],
  })
  async getUserDesigns(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.designService.getUserDesigns(userId),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific design by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the design',
    type: DesignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async getUserDesignById(@Request() req, @Param('id') designId: string) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.designService.getUserDesignById(userId, designId),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new design' })
  @ApiResponse({
    status: 201,
    description: 'Design created successfully',
    type: DesignResponseDto,
  })
  async createDesign(@Request() req, @Body() createDesignDto: CreateDesignDto) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.designService.createDesign(userId, createDesignDto),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing design' })
  @ApiResponse({
    status: 200,
    description: 'Design updated successfully',
    type: DesignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async updateDesign(
    @Request() req,
    @Param('id') designId: string,
    @Body() updateDesignDto: UpdateDesignDto,
  ) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.designService.updateDesign(userId, designId, updateDesignDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a design' })
  @ApiResponse({ status: 200, description: 'Design deleted successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async deleteDesign(@Request() req, @Param('id') designId: string) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.designService.deleteDesign(userId, designId),
    };
  }
}
