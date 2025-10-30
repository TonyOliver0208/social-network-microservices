/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(4);
const common_2 = __webpack_require__(6);
const prisma_module_1 = __webpack_require__(7);
const post_module_1 = __webpack_require__(10);
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
/* 6 */
/***/ ((module) => {

module.exports = require("@app/common");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
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
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(3);
const client_post_1 = __webpack_require__(9);
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
/* 9 */
/***/ ((module) => {

module.exports = require(".prisma/client-post");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostModule = void 0;
const common_1 = __webpack_require__(3);
const post_controller_1 = __webpack_require__(11);
const post_service_1 = __webpack_require__(12);
const prisma_module_1 = __webpack_require__(7);
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
/* 11 */
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
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const post_service_1 = __webpack_require__(12);
const common_2 = __webpack_require__(6);
const post_1 = __webpack_require__(15);
let PostController = PostController_1 = class PostController {
    constructor(postService) {
        this.postService = postService;
        this.logger = new common_1.Logger(PostController_1.name);
    }
    async createPost(data) {
        this.logger.log(`Creating post for user: ${data.userId}`);
        return this.postService.createPost(data.userId, data.createPostDto);
    }
    async getPost(data) {
        this.logger.log(`Getting post: ${data.postId}`);
        return this.postService.getPost(data.postId, data.userId);
    }
    async updatePost(data) {
        this.logger.log(`Updating post: ${data.postId} by user: ${data.userId}`);
        return this.postService.updatePost(data.postId, data.userId, data.updatePostDto);
    }
    async deletePost(data) {
        this.logger.log(`Deleting post: ${data.postId} by user: ${data.userId}`);
        return this.postService.deletePost(data.postId, data.userId);
    }
    async getFeed(data) {
        this.logger.log(`Getting feed for user: ${data.userId}`);
        return this.postService.getFeed(data.userId, data.pagination);
    }
    async getUserPosts(data) {
        this.logger.log(`Getting posts for user: ${data.userId}`);
        return this.postService.getUserPosts(data.userId, data.pagination);
    }
    async likePost(data) {
        this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
        return this.postService.likePost(data.postId, data.userId);
    }
    async unlikePost(data) {
        this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
        return this.postService.unlikePost(data.postId, data.userId);
    }
    async getPostLikes(data) {
        this.logger.log(`Getting likes for post: ${data.postId}`);
        return this.postService.getPostLikes(data.postId, data.pagination);
    }
    async createComment(data) {
        this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
        return this.postService.createComment(data.postId, data.userId, data.createCommentDto);
    }
    async updateComment(data) {
        this.logger.log(`Updating comment: ${data.commentId}`);
        return this.postService.updateComment(data.commentId, data.userId, data.content);
    }
    async deleteComment(data) {
        this.logger.log(`Deleting comment: ${data.commentId}`);
        return this.postService.deleteComment(data.commentId, data.userId);
    }
    async getPostComments(data) {
        this.logger.log(`Getting comments for post: ${data.postId}`);
        return this.postService.getPostComments(data.postId, data.pagination);
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
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'LikePost'),
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
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeleteComment'),
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
/* 12 */
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
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const prisma_service_1 = __webpack_require__(8);
const common_2 = __webpack_require__(6);
const cache_manager_1 = __webpack_require__(13);
const cache_manager_2 = __webpack_require__(14);
let PostService = class PostService {
    constructor(prisma, rabbitClient, cacheManager) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
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
        return post;
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
        const result = {
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            likes: undefined,
        };
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
        return updatedPost;
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
            data: posts.map(post => ({
                ...post,
                isLiked: post.likes.length > 0,
                likes: undefined,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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
            data: comments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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
/* 13 */
/***/ ((module) => {

module.exports = require("cache-manager");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POSTSERVICE_SERVICE_NAME = exports.POST_PACKAGE_NAME = void 0;
exports.POST_PACKAGE_NAME = 'post';
exports.POSTSERVICE_SERVICE_NAME = 'PostService';


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
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

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(2);
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(4);
const app_module_1 = __webpack_require__(5);
const path_1 = __webpack_require__(16);
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