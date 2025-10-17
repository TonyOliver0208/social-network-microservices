import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGES, JwtAuthGuard, PaginationDto } from '@app/common';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    @Inject(SERVICES.SEARCH_SERVICE)
    private readonly searchClient: ClientProxy,
  ) {}

  @Get('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search posts' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchPosts(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await firstValueFrom(
        this.searchClient.send(MESSAGES.SEARCH_POSTS, {
          query,
          ...pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await firstValueFrom(
        this.searchClient.send(MESSAGES.SEARCH_USERS, {
          query,
          ...pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
