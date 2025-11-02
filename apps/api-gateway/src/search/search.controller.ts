import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { SERVICES, JwtAuthGuard, PaginationDto } from '@app/common';
import { SearchService, SEARCHSERVICE_SERVICE_NAME } from '@app/proto/search';

@ApiTags('search')
@Controller('search')
export class SearchController implements OnModuleInit {
  private searchService: SearchService;

  constructor(
    @Inject(SERVICES.SEARCH_SERVICE)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.searchService = this.client.getService<SearchService>(SEARCHSERVICE_SERVICE_NAME);
  }

  @Get('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search posts' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await lastValueFrom(
        this.searchService.SearchPosts({
          query,
          page: page || 1,
          limit: limit || 20,
        }),
      );
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await lastValueFrom(
        this.searchService.SearchUsers({
          query,
          page: page || 1,
          limit: limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
