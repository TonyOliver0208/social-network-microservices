import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PostIndex, PostIndexSchema } from './schemas/post-index.schema';
import { UserIndex, UserIndexSchema } from './schemas/user-index.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostIndex.name, schema: PostIndexSchema },
      { name: UserIndex.name, schema: UserIndexSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
