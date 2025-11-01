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
const mongoose_1 = __webpack_require__(6);
const search_module_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('SEARCH_MONGODB_URI') || 'mongodb://localhost:27017/devcoll_search',
                }),
                inject: [config_1.ConfigService],
            }),
            search_module_1.SearchModule,
        ],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

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
exports.SearchModule = void 0;
const common_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(6);
const search_controller_1 = __webpack_require__(8);
const search_service_1 = __webpack_require__(9);
const post_index_schema_1 = __webpack_require__(11);
const user_index_schema_1 = __webpack_require__(12);
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: post_index_schema_1.PostIndex.name, schema: post_index_schema_1.PostIndexSchema },
                { name: user_index_schema_1.UserIndex.name, schema: user_index_schema_1.UserIndexSchema },
            ]),
        ],
        controllers: [search_controller_1.SearchController],
        providers: [search_service_1.SearchService],
        exports: [search_service_1.SearchService],
    })
], SearchModule);


/***/ }),
/* 8 */
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
var SearchController_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const search_service_1 = __webpack_require__(9);
const common_2 = __webpack_require__(13);
const dto_1 = __webpack_require__(14);
const search_1 = __webpack_require__(16);
const grpc_js_1 = __webpack_require__(17);
let SearchController = SearchController_1 = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
        this.logger = new common_1.Logger(SearchController_1.name);
    }
    async searchPosts(payload) {
        this.logger.log(`Search posts request: ${payload.query}`);
        const result = await this.searchService.searchPosts(payload.query, payload.page, payload.limit, payload.privacy);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async searchUsers(payload) {
        this.logger.log(`Search users request: ${payload.query}`);
        const result = await this.searchService.searchUsers(payload.query, payload.page, payload.limit);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    getGrpcStatusCode(error, httpStatusCode) {
        if (error?.includes('not found')) {
            return grpc_js_1.status.NOT_FOUND;
        }
        if (error?.includes('invalid') || error?.includes('validation') || error?.includes('query too short')) {
            return grpc_js_1.status.INVALID_ARGUMENT;
        }
        if (error?.includes('timeout') || error?.includes('deadline')) {
            return grpc_js_1.status.DEADLINE_EXCEEDED;
        }
        switch (httpStatusCode) {
            case 404:
                return grpc_js_1.status.NOT_FOUND;
            case 400:
                return grpc_js_1.status.INVALID_ARGUMENT;
            case 408:
            case 504:
                return grpc_js_1.status.DEADLINE_EXCEEDED;
            default:
                return grpc_js_1.status.UNKNOWN;
        }
    }
    async handlePostCreated(data) {
        this.logger.log(`Indexing new post: ${data.postId}`);
        await this.searchService.indexPost(data);
    }
    async handlePostUpdated(data) {
        this.logger.log(`Updating post index: ${data.postId}`);
        await this.searchService.updatePostIndex(data.postId, data);
    }
    async handlePostDeleted(data) {
        this.logger.log(`Removing post from index: ${data.postId}`);
        await this.searchService.removePostFromIndex(data.postId);
    }
    async handleUserRegistered(data) {
        this.logger.log(`Indexing new user: ${data.userId}`);
        await this.searchService.indexUser(data);
    }
    async handleUserUpdated(data) {
        this.logger.log(`Updating user index: ${data.userId}`);
        await this.searchService.updateUserIndex(data.userId, data);
    }
    async handleUserDeleted(data) {
        this.logger.log(`Removing user from index: ${data.userId}`);
        await this.searchService.removeUserFromIndex(data.userId);
    }
    async handleCommentCreated(data) {
        this.logger.log(`Updating post index after comment: ${data.postId}`);
    }
    async handlePostLiked(data) {
        this.logger.log(`Updating post index after like: ${data.postId}`);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, microservices_1.GrpcMethod)(search_1.SEARCHSERVICE_SERVICE_NAME, 'SearchPosts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof dto_1.SearchQueryDto !== "undefined" && dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchPosts", null);
__decorate([
    (0, microservices_1.GrpcMethod)(search_1.SEARCHSERVICE_SERVICE_NAME, 'SearchUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.SearchQueryDto !== "undefined" && dto_1.SearchQueryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchUsers", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_CREATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.IndexPostDto !== "undefined" && dto_1.IndexPostDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handlePostCreated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_UPDATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof dto_1.IndexPostDto !== "undefined" && dto_1.IndexPostDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handlePostUpdated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handlePostDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_REGISTERED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof dto_1.IndexUserDto !== "undefined" && dto_1.IndexUserDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handleUserRegistered", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_UPDATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof dto_1.IndexUserDto !== "undefined" && dto_1.IndexUserDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handleUserUpdated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handleUserDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.COMMENT_CREATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handleCommentCreated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_LIKED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "handlePostLiked", null);
exports.SearchController = SearchController = SearchController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof search_service_1.SearchService !== "undefined" && search_service_1.SearchService) === "function" ? _a : Object])
], SearchController);


/***/ }),
/* 9 */
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
var SearchService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchService = void 0;
const common_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(6);
const mongoose_2 = __webpack_require__(10);
const post_index_schema_1 = __webpack_require__(11);
const user_index_schema_1 = __webpack_require__(12);
let SearchService = SearchService_1 = class SearchService {
    constructor(postIndexModel, userIndexModel) {
        this.postIndexModel = postIndexModel;
        this.userIndexModel = userIndexModel;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async searchPosts(query, page = 1, limit = 20, privacy) {
        try {
            const searchQuery = {
                $text: { $search: query },
                isActive: true,
            };
            if (privacy) {
                searchQuery.privacy = privacy;
            }
            else {
                searchQuery.privacy = 'PUBLIC';
            }
            const skip = (page - 1) * limit;
            const [posts, total] = await Promise.all([
                this.postIndexModel
                    .find(searchQuery, { score: { $meta: 'textScore' } })
                    .sort({ score: { $meta: 'textScore' }, postedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.postIndexModel.countDocuments(searchQuery),
            ]);
            return {
                success: true,
                data: {
                    posts,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Search posts failed: ${error.message}`);
            return {
                success: false,
                error: 'Failed to search posts',
            };
        }
    }
    async indexPost(data) {
        try {
            await this.postIndexModel.create({
                postId: data.postId,
                userId: data.userId,
                content: data.content,
                tags: data.tags || [],
                mediaUrls: data.mediaUrls || [],
                privacy: data.privacy || 'PUBLIC',
                postedAt: data.postedAt || new Date(),
                isActive: true,
            });
            this.logger.log(`Post indexed: ${data.postId}`);
        }
        catch (error) {
            this.logger.error(`Failed to index post: ${error.message}`);
        }
    }
    async updatePostIndex(postId, data) {
        try {
            await this.postIndexModel.updateOne({ postId }, { $set: data });
            this.logger.log(`Post index updated: ${postId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update post index: ${error.message}`);
        }
    }
    async removePostFromIndex(postId) {
        try {
            await this.postIndexModel.updateOne({ postId }, { $set: { isActive: false } });
            this.logger.log(`Post removed from index: ${postId}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove post from index: ${error.message}`);
        }
    }
    async searchUsers(query, page = 1, limit = 20) {
        try {
            const searchQuery = {
                $text: { $search: query },
                isActive: true,
            };
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                this.userIndexModel
                    .find(searchQuery, { score: { $meta: 'textScore' } })
                    .sort({ score: { $meta: 'textScore' }, followersCount: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.userIndexModel.countDocuments(searchQuery),
            ]);
            return {
                success: true,
                data: {
                    users,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Search users failed: ${error.message}`);
            return {
                success: false,
                error: 'Failed to search users',
            };
        }
    }
    async indexUser(data) {
        try {
            await this.userIndexModel.create({
                userId: data.userId,
                username: data.username,
                fullName: data.fullName || '',
                bio: data.bio || '',
                avatar: data.avatar || '',
                isActive: true,
                lastActive: new Date(),
            });
            this.logger.log(`User indexed: ${data.userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to index user: ${error.message}`);
        }
    }
    async updateUserIndex(userId, data) {
        try {
            await this.userIndexModel.updateOne({ userId }, { $set: { ...data, lastActive: new Date() } });
            this.logger.log(`User index updated: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update user index: ${error.message}`);
        }
    }
    async removeUserFromIndex(userId) {
        try {
            await this.userIndexModel.updateOne({ userId }, { $set: { isActive: false } });
            this.logger.log(`User removed from index: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove user from index: ${error.message}`);
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_index_schema_1.PostIndex.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_index_schema_1.UserIndex.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object])
], SearchService);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("mongoose");

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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostIndexSchema = exports.PostIndex = void 0;
const mongoose_1 = __webpack_require__(6);
let PostIndex = class PostIndex {
};
exports.PostIndex = PostIndex;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], PostIndex.prototype, "postId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], PostIndex.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, text: true }),
    __metadata("design:type", String)
], PostIndex.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PostIndex.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PostIndex.prototype, "mediaUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'], default: 'PUBLIC', index: true }),
    __metadata("design:type", String)
], PostIndex.prototype, "privacy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PostIndex.prototype, "likesCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PostIndex.prototype, "commentsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], PostIndex.prototype, "postedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PostIndex.prototype, "isActive", void 0);
exports.PostIndex = PostIndex = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PostIndex);
exports.PostIndexSchema = mongoose_1.SchemaFactory.createForClass(PostIndex);
exports.PostIndexSchema.index({ content: 'text', tags: 'text' });
exports.PostIndexSchema.index({ userId: 1, postedAt: -1 });
exports.PostIndexSchema.index({ privacy: 1, postedAt: -1 });


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserIndexSchema = exports.UserIndex = void 0;
const mongoose_1 = __webpack_require__(6);
let UserIndex = class UserIndex {
};
exports.UserIndex = UserIndex;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], UserIndex.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true, text: true }),
    __metadata("design:type", String)
], UserIndex.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ text: true }),
    __metadata("design:type", String)
], UserIndex.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ text: true }),
    __metadata("design:type", String)
], UserIndex.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserIndex.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UserIndex.prototype, "followersCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UserIndex.prototype, "followingCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UserIndex.prototype, "postsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserIndex.prototype, "isVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], UserIndex.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], UserIndex.prototype, "lastActive", void 0);
exports.UserIndex = UserIndex = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserIndex);
exports.UserIndexSchema = mongoose_1.SchemaFactory.createForClass(UserIndex);
exports.UserIndexSchema.index({ username: 'text', fullName: 'text', bio: 'text' });
exports.UserIndexSchema.index({ isActive: 1, lastActive: -1 });


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@app/common");

/***/ }),
/* 14 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IndexUserDto = exports.IndexPostDto = exports.SearchQueryDto = void 0;
const class_validator_1 = __webpack_require__(15);
class SearchQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PUBLIC', 'FRIENDS']),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "privacy", void 0);
class IndexPostDto {
}
exports.IndexPostDto = IndexPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexPostDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexPostDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexPostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], IndexPostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], IndexPostDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IndexPostDto.prototype, "privacy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], IndexPostDto.prototype, "postedAt", void 0);
class IndexUserDto {
}
exports.IndexUserDto = IndexUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexUserDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndexUserDto.prototype, "avatar", void 0);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SEARCHSERVICE_SERVICE_NAME = exports.SEARCH_PACKAGE_NAME = void 0;
exports.SEARCH_PACKAGE_NAME = 'search';
exports.SEARCHSERVICE_SERVICE_NAME = 'SearchService';


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 18 */
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
const path_1 = __webpack_require__(18);
async function bootstrap() {
    const logger = new common_1.Logger('SearchService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('SEARCH_SERVICE_PORT', 50055);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${port}`,
            package: 'search',
            protoPath: (0, path_1.join)(__dirname, '../../../proto/search.proto'),
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
            queue: 'search_queue',
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
    logger.log(`🔍 Search Service (gRPC) is running on port ${port}`);
    logger.log(`� Search Service (RabbitMQ) connected to search_queue`);
}
bootstrap();

})();

/******/ })()
;