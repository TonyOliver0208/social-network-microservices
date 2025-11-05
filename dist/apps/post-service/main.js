/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/post-service/src/app.module.ts":
/*!*********************************************!*\
  !*** ./apps/post-service/src/app.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const prisma_module_1 = __webpack_require__(/*! ./prisma/prisma.module */ "./apps/post-service/src/prisma/prisma.module.ts");
const post_module_1 = __webpack_require__(/*! ./post/post.module */ "./apps/post-service/src/post/post.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            common_2.RabbitMQModule.register({
                name: 'POST_SERVICE',
                queue: 'post_queue'
            }),
            common_2.RedisModule.register(),
            prisma_module_1.PrismaModule,
            post_module_1.PostModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/post-service/src/post/post.controller.ts":
/*!*******************************************************!*\
  !*** ./apps/post-service/src/post/post.controller.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PostController_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const post_service_1 = __webpack_require__(/*! ./post.service */ "./apps/post-service/src/post/post.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const post_1 = __webpack_require__(/*! @app/proto/post */ "./generated/post.ts");
const grpc_js_1 = __webpack_require__(/*! @grpc/grpc-js */ "@grpc/grpc-js");
let PostController = PostController_1 = class PostController {
    constructor(postService) {
        this.postService = postService;
        this.logger = new common_1.Logger(PostController_1.name);
    }
    async createPost(data) {
        try {
            this.logger.log(`Creating post for user: ${data.userId}`);
            const createPostDto = {
                content: data.content,
                mediaUrls: data.mediaUrls,
                privacy: data.visibility,
            };
            return await this.postService.createPost(data.userId, createPostDto);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPost(data) {
        try {
            this.logger.log(`Getting post: ${data.id}`);
            return await this.postService.getPost(data.id, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async updatePost(data) {
        try {
            this.logger.log(`Updating post: ${data.id} by user: ${data.userId}`);
            return await this.postService.updatePost(data.id, data.userId, data.updatePostDto);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async deletePost(data) {
        try {
            this.logger.log(`Deleting post: ${data.id} by user: ${data.userId}`);
            return await this.postService.deletePost(data.id, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getFeed(data) {
        try {
            this.logger.log(`Getting feed for user: ${data.userId}`);
            const result = await this.postService.getFeed(data.userId, { page: data.page, limit: data.limit });
            this.logger.log(`Feed result:`, JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            this.logger.error(`Error: ${error.message}`, error.stack);
            throw this.handleException(error);
        }
    }
    async getUserPosts(data) {
        try {
            this.logger.log(`Getting posts for user: ${data.userId}`);
            return await this.postService.getUserPosts(data.userId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async likePost(data) {
        try {
            this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
            return await this.postService.likePost(data.postId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async unlikePost(data) {
        try {
            this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
            return await this.postService.unlikePost(data.postId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostLikes(data) {
        try {
            this.logger.log(`Getting likes for post: ${data.postId}`);
            return await this.postService.getPostLikes(data.postId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async createComment(data) {
        try {
            this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
            return await this.postService.createComment(data.postId, data.userId, data.createCommentDto);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async updateComment(data) {
        try {
            this.logger.log(`Updating comment: ${data.commentId}`);
            return await this.postService.updateComment(data.commentId, data.userId, data.content);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async deleteComment(data) {
        try {
            this.logger.log(`Deleting comment: ${data.commentId}`);
            return await this.postService.deleteComment(data.commentId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostComments(data) {
        try {
            this.logger.log(`Getting comments for post: ${data.postId}`);
            return await this.postService.getPostComments(data.postId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    handleException(error) {
        const errorMessage = error.message || 'Internal server error';
        const grpcCode = this.getGrpcStatusCode(errorMessage, error.status);
        this.logger.error(`Error: ${errorMessage}`, error.stack);
        return new microservices_1.RpcException({
            code: grpcCode,
            message: errorMessage,
        });
    }
    getGrpcStatusCode(error, httpStatusCode) {
        if (error?.includes('already exists') || error?.includes('duplicate') || error?.includes('already liked')) {
            return grpc_js_1.status.ALREADY_EXISTS;
        }
        if (error?.includes('not found') || error?.includes('does not exist')) {
            return grpc_js_1.status.NOT_FOUND;
        }
        if (error?.includes('Unauthorized')) {
            return grpc_js_1.status.UNAUTHENTICATED;
        }
        if (error?.includes('Forbidden') || error?.includes('only') || error?.includes('cannot')) {
            return grpc_js_1.status.PERMISSION_DENIED;
        }
        if (error?.includes('invalid') || error?.includes('validation') || error?.includes('required')) {
            return grpc_js_1.status.INVALID_ARGUMENT;
        }
        switch (httpStatusCode) {
            case 409:
                return grpc_js_1.status.ALREADY_EXISTS;
            case 404:
                return grpc_js_1.status.NOT_FOUND;
            case 401:
                return grpc_js_1.status.UNAUTHENTICATED;
            case 403:
                return grpc_js_1.status.PERMISSION_DENIED;
            case 400:
                return grpc_js_1.status.INVALID_ARGUMENT;
            default:
                return grpc_js_1.status.UNKNOWN;
        }
    }
    async handleUserDeleted(data) {
        this.logger.log(`Handling user deleted event: ${data.userId}`);
        await this.postService.handleUserDeleted(data.userId);
    }
    async handleMediaDeleted(data) {
        this.logger.log(`Handling media deleted event: ${data.mediaId}`);
        if (data.postId) {
        }
    }
    async handleUserFollowed(data) {
        this.logger.log(`User ${data.followerId} followed ${data.followingId}`);
    }
};
exports.PostController = PostController;
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreatePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPostById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UpdatePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeletePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetFeed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFeed", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetUserPosts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserPosts", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'LikePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "likePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UnlikePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "unlikePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPostLikes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostLikes", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreateComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UpdateComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updateComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeleteComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deleteComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetComments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostComments", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "handleUserDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.MEDIA_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "handleMediaDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_FOLLOWED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "handleUserFollowed", null);
exports.PostController = PostController = PostController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof post_service_1.PostService !== "undefined" && post_service_1.PostService) === "function" ? _a : Object])
], PostController);


/***/ }),

/***/ "./apps/post-service/src/post/post.module.ts":
/*!***************************************************!*\
  !*** ./apps/post-service/src/post/post.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const post_controller_1 = __webpack_require__(/*! ./post.controller */ "./apps/post-service/src/post/post.controller.ts");
const post_service_1 = __webpack_require__(/*! ./post.service */ "./apps/post-service/src/post/post.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./apps/post-service/src/prisma/prisma.module.ts");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [post_controller_1.PostController],
        providers: [post_service_1.PostService],
    })
], PostModule);


/***/ }),

/***/ "./apps/post-service/src/post/post.service.ts":
/*!****************************************************!*\
  !*** ./apps/post-service/src/post/post.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
let PostService = class PostService {
    constructor(prisma, rabbitClient, cacheManager) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
    }
    formatPostResponse(post) {
        return {
            id: post.id,
            userId: post.authorId,
            content: post.content,
            mediaUrls: post.mediaUrls || [],
            likesCount: post._count?.likes || 0,
            commentsCount: post._count?.comments || 0,
            visibility: post.privacy,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        };
    }
    async createPost(userId, createPostDto) {
        const post = await this.prisma.post.create({
            data: {
                ...createPostDto,
                authorId: userId,
            },
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        this.rabbitClient.emit(common_2.EVENTS.POST_CREATED, {
            postId: post.id,
            authorId: userId,
            content: post.content,
            createdAt: post.createdAt,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(userId));
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(''));
        return this.formatPostResponse(post);
    }
    async getPost(postId, userId) {
        const cacheKey = common_2.CACHE_KEYS.POST(postId);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: userId ? {
                    where: { userId },
                    select: { id: true },
                } : false,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const result = this.formatPostResponse(post);
        await this.cacheManager.set(cacheKey, result, common_2.CACHE_TTL.MEDIUM);
        return result;
    }
    async updatePost(postId, userId, updatePostDto) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own posts');
        }
        const updatedPost = await this.prisma.post.update({
            where: { id: postId },
            data: updatePostDto,
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(postId));
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(userId));
        return this.formatPostResponse(updatedPost);
    }
    async deletePost(postId, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
        await this.prisma.post.delete({
            where: { id: postId },
        });
        this.rabbitClient.emit(common_2.EVENTS.POST_DELETED, {
            postId,
            authorId: userId,
            mediaUrls: post.mediaUrls,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(postId));
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(userId));
        return { message: 'Post deleted successfully' };
    }
    async getFeed(userId, pagination) {
        const cacheKey = common_2.CACHE_KEYS.USER_FEED(userId);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                    likes: {
                        where: { userId },
                        select: { id: true },
                    },
                },
            }),
            this.prisma.post.count(),
        ]);
        const result = {
            posts: posts.map(post => this.formatPostResponse(post)),
            total,
            page,
            limit,
        };
        await this.cacheManager.set(cacheKey, result, common_2.CACHE_TTL.SHORT);
        return result;
    }
    async getUserPosts(userId, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            this.prisma.post.count({
                where: { authorId: userId },
            }),
        ]);
        return {
            posts: posts.map(post => this.formatPostResponse(post)),
            total,
            page,
            limit,
        };
    }
    async likePost(postId, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const existingLike = await this.prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (existingLike) {
            return { message: 'Post already liked' };
        }
        await this.prisma.like.create({
            data: {
                postId,
                userId,
            },
        });
        this.rabbitClient.emit(common_2.EVENTS.POST_LIKED, {
            postId,
            userId,
            authorId: post.authorId,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(postId));
        return { message: 'Post liked successfully' };
    }
    async unlikePost(postId, userId) {
        const existingLike = await this.prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (!existingLike) {
            throw new common_1.NotFoundException('Like not found');
        }
        await this.prisma.like.delete({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(postId));
        return { message: 'Post unliked successfully' };
    }
    async getPostLikes(postId, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [likes, total] = await Promise.all([
            this.prisma.like.findMany({
                where: { postId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    userId: true,
                    createdAt: true,
                },
            }),
            this.prisma.like.count({
                where: { postId },
            }),
        ]);
        return {
            data: likes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createComment(postId, userId, createCommentDto) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (createCommentDto.parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: createCommentDto.parentId },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException('Parent comment not found');
            }
        }
        const comment = await this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                postId,
                authorId: userId,
                parentId: createCommentDto.parentId,
            },
        });
        this.rabbitClient.emit(common_2.EVENTS.COMMENT_CREATED, {
            commentId: comment.id,
            postId,
            authorId: userId,
            content: comment.content,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(postId));
        return comment;
    }
    async updateComment(commentId, userId, content) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own comments');
        }
        const updatedComment = await this.prisma.comment.update({
            where: { id: commentId },
            data: { content },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(comment.postId));
        return updatedComment;
    }
    async deleteComment(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.comment.delete({
            where: { id: commentId },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(comment.postId));
        return { message: 'Comment deleted successfully' };
    }
    async getPostComments(postId, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: {
                    postId,
                    parentId: null,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    replies: {
                        take: 3,
                        orderBy: { createdAt: 'asc' },
                    },
                    _count: {
                        select: {
                            replies: true,
                        },
                    },
                },
            }),
            this.prisma.comment.count({
                where: {
                    postId,
                    parentId: null,
                },
            }),
        ]);
        return {
            comments: comments.map(comment => ({
                id: comment.id,
                postId: comment.postId,
                userId: comment.authorId,
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
            })),
            total,
        };
    }
    async handleUserDeleted(userId) {
        await this.prisma.post.deleteMany({
            where: { authorId: userId },
        });
        await this.prisma.comment.deleteMany({
            where: { authorId: userId },
        });
        await this.prisma.like.deleteMany({
            where: { userId },
        });
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('POST_SERVICE')),
    __param(2, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _c : Object])
], PostService);


/***/ }),

/***/ "./apps/post-service/src/prisma/prisma.module.ts":
/*!*******************************************************!*\
  !*** ./apps/post-service/src/prisma/prisma.module.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),

/***/ "./apps/post-service/src/prisma/prisma.service.ts":
/*!********************************************************!*\
  !*** ./apps/post-service/src/prisma/prisma.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_post_1 = __webpack_require__(/*! .prisma/client-post */ ".prisma/client-post");
let PrismaService = class PrismaService extends client_post_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),

/***/ "./generated/post.ts":
/*!***************************!*\
  !*** ./generated/post.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POSTSERVICE_SERVICE_NAME = exports.POST_PACKAGE_NAME = void 0;
exports.POST_PACKAGE_NAME = 'post';
exports.POSTSERVICE_SERVICE_NAME = 'PostService';


/***/ }),

/***/ ".prisma/client-post":
/*!**************************************!*\
  !*** external ".prisma/client-post" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require(".prisma/client-post");

/***/ }),

/***/ "@app/common":
/*!******************************!*\
  !*** external "@app/common" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@app/common");

/***/ }),

/***/ "@grpc/grpc-js":
/*!********************************!*\
  !*** external "@grpc/grpc-js" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),

/***/ "@nestjs/cache-manager":
/*!****************************************!*\
  !*** external "@nestjs/cache-manager" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "cache-manager":
/*!********************************!*\
  !*** external "cache-manager" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("cache-manager");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***************************************!*\
  !*** ./apps/post-service/src/main.ts ***!
  \***************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/post-service/src/app.module.ts");
const path_1 = __webpack_require__(/*! path */ "path");
async function bootstrap() {
    const logger = new common_1.Logger('PostService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('POST_SERVICE_PORT', 50053);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${port}`,
            package: 'post',
            protoPath: (0, path_1.join)(__dirname, '..', '..', '..', 'proto', 'post.proto'),
            loader: {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        },
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: 'post_queue',
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.startAllMicroservices();
    logger.log(`📝 Post Service (gRPC) is running on port ${port}`);
    logger.log(`📨 Post Service (RabbitMQ) connected to post_queue`);
}
bootstrap();

})();

/******/ })()
;