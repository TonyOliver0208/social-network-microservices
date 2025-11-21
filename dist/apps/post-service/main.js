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

/***/ "./apps/post-service/src/post/controllers/post-protected.controller.ts":
/*!*****************************************************************************!*\
  !*** ./apps/post-service/src/post/controllers/post-protected.controller.ts ***!
  \*****************************************************************************/
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
var PostProtectedController_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostProtectedController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const post_logic_service_1 = __webpack_require__(/*! ../services/logic/post-logic.service */ "./apps/post-service/src/post/services/logic/post-logic.service.ts");
const like_logic_service_1 = __webpack_require__(/*! ../services/logic/like-logic.service */ "./apps/post-service/src/post/services/logic/like-logic.service.ts");
const comment_logic_service_1 = __webpack_require__(/*! ../services/logic/comment-logic.service */ "./apps/post-service/src/post/services/logic/comment-logic.service.ts");
const tag_logic_service_1 = __webpack_require__(/*! ../services/logic/tag-logic.service */ "./apps/post-service/src/post/services/logic/tag-logic.service.ts");
const vote_logic_service_1 = __webpack_require__(/*! ../services/logic/vote-logic.service */ "./apps/post-service/src/post/services/logic/vote-logic.service.ts");
const answer_logic_service_1 = __webpack_require__(/*! ../services/logic/answer-logic.service */ "./apps/post-service/src/post/services/logic/answer-logic.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const post_1 = __webpack_require__(/*! @app/proto/post */ "./generated/post.ts");
const grpc_js_1 = __webpack_require__(/*! @grpc/grpc-js */ "@grpc/grpc-js");
let PostProtectedController = PostProtectedController_1 = class PostProtectedController {
    constructor(postLogic, likeLogic, commentLogic, tagLogic, voteLogic, answerLogic) {
        this.postLogic = postLogic;
        this.likeLogic = likeLogic;
        this.commentLogic = commentLogic;
        this.tagLogic = tagLogic;
        this.voteLogic = voteLogic;
        this.answerLogic = answerLogic;
        this.logger = new common_1.Logger(PostProtectedController_1.name);
    }
    async createPost(data) {
        try {
            this.logger.log(`Creating post for user: ${data.userId} with tags:`, data.tags);
            const createPostDto = {
                content: data.content,
                mediaUrls: data.mediaUrls,
                privacy: data.visibility,
                tags: data.tags,
            };
            return await this.postLogic.createPost(data.userId, createPostDto);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async updatePost(data) {
        try {
            this.logger.log(`Updating post: ${data.id} by user: ${data.userId}`);
            return await this.postLogic.updatePost(data.id, data.userId, data.updatePostDto);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async deletePost(data) {
        try {
            this.logger.log(`Deleting post: ${data.id} by user: ${data.userId}`);
            return await this.postLogic.deletePost(data.id, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async likePost(data) {
        try {
            this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
            return await this.likeLogic.likePost(data.postId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async unlikePost(data) {
        try {
            this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
            return await this.likeLogic.unlikePost(data.postId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostLikes(data) {
        try {
            this.logger.log(`Getting likes for post: ${data.postId}`);
            return await this.likeLogic.getPostLikes(data.postId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async createComment(data) {
        try {
            this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
            return await this.commentLogic.createComment(data.userId, {
                content: data.content,
                postId: data.postId
            });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async updateComment(data) {
        try {
            this.logger.log(`Updating comment: ${data.commentId}`);
            return await this.commentLogic.updateComment(data.commentId, data.userId, data.content);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async deleteComment(data) {
        try {
            this.logger.log(`Deleting comment: ${data.commentId}`);
            return await this.commentLogic.deleteComment(data.commentId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostComments(data) {
        try {
            this.logger.log(`Getting comments for post: ${data.postId}`);
            return await this.commentLogic.getPostComments(data.postId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async createTag(data) {
        try {
            this.logger.log(`Creating tag: ${data.name}`);
            return await this.tagLogic.createTag(data.name, data.description);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async voteQuestion(data) {
        try {
            this.logger.log(`User ${data.userId} voting ${data.voteType} on question ${data.questionId}`);
            return await this.voteLogic.voteQuestion(data.questionId, data.userId, data.voteType);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getQuestionVotes(data) {
        try {
            this.logger.log(`Getting votes for question ${data.questionId}`);
            return await this.voteLogic.getQuestionVotes(data.questionId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async favoriteQuestion(data) {
        try {
            this.logger.log(`User ${data.userId} favoriting question ${data.questionId}`);
            return await this.voteLogic.favoriteQuestion(data.questionId, data.userId, data.listName);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async unfavoriteQuestion(data) {
        try {
            this.logger.log(`User ${data.userId} unfavoriting question ${data.questionId}`);
            return await this.voteLogic.unfavoriteQuestion(data.questionId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getUserFavorites(data) {
        try {
            this.logger.log(`Getting favorites for user ${data.userId}`);
            return await this.voteLogic.getUserFavorites(data.userId, data.listName, data.page || 1, data.limit || 20);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async createAnswer(data) {
        try {
            this.logger.log(`User ${data.userId} creating answer for question ${data.questionId}`);
            return await this.answerLogic.createAnswer(data.questionId, data.userId, data.content);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async updateAnswer(data) {
        try {
            this.logger.log(`User ${data.userId} updating answer ${data.answerId}`);
            return await this.answerLogic.updateAnswer(data.answerId, data.userId, data.content);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async deleteAnswer(data) {
        try {
            this.logger.log(`User ${data.userId} deleting answer ${data.answerId}`);
            return await this.answerLogic.deleteAnswer(data.answerId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async acceptAnswer(data) {
        try {
            this.logger.log(`User ${data.userId} accepting answer ${data.answerId}`);
            return await this.answerLogic.acceptAnswer(data.answerId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async voteAnswer(data) {
        try {
            this.logger.log(`User ${data.userId} voting ${data.voteType} on answer ${data.answerId}`);
            return await this.answerLogic.voteAnswer(data.answerId, data.userId, data.voteType);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getAnswerVotes(data) {
        try {
            this.logger.log(`Getting votes for answer ${data.answerId}`);
            return await this.answerLogic.getAnswerVotes(data.answerId, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getQuestionAnswers(data) {
        try {
            this.logger.log(`Getting answers for question ${data.questionId}`);
            const answers = await this.answerLogic.getQuestionAnswers(data.questionId, data.userId);
            return { answers };
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async handleUserDeletedEvent(data) {
        this.logger.log(`[Event] User deleted: ${data.userId}`);
        await this.postLogic.handleUserDeleted(data.userId);
    }
    async handleMediaDeleted(data) {
        this.logger.log(`Handling media deleted event: ${data.mediaId}`);
    }
    async handleUserFollowed(data) {
        this.logger.log(`User ${data.followerId} followed ${data.followingId}`);
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
};
exports.PostProtectedController = PostProtectedController;
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreatePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "createPost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UpdatePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "updatePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeletePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "deletePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'LikePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "likePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UnlikePost'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "unlikePost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPostLikes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getPostLikes", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreateComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "createComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UpdateComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "updateComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeleteComment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "deleteComment", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetComments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getPostComments", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreateTag'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "createTag", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'VoteQuestion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "voteQuestion", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetQuestionVotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getQuestionVotes", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'FavoriteQuestion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "favoriteQuestion", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UnfavoriteQuestion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "unfavoriteQuestion", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetUserFavorites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getUserFavorites", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'CreateAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "createAnswer", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'UpdateAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "updateAnswer", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'DeleteAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "deleteAnswer", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'AcceptAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "acceptAnswer", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'VoteAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "voteAnswer", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetAnswerVotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getAnswerVotes", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetQuestionAnswers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "getQuestionAnswers", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "handleUserDeletedEvent", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.MEDIA_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "handleMediaDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_FOLLOWED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostProtectedController.prototype, "handleUserFollowed", null);
exports.PostProtectedController = PostProtectedController = PostProtectedController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof post_logic_service_1.PostLogicService !== "undefined" && post_logic_service_1.PostLogicService) === "function" ? _a : Object, typeof (_b = typeof like_logic_service_1.LikeLogicService !== "undefined" && like_logic_service_1.LikeLogicService) === "function" ? _b : Object, typeof (_c = typeof comment_logic_service_1.CommentLogicService !== "undefined" && comment_logic_service_1.CommentLogicService) === "function" ? _c : Object, typeof (_d = typeof tag_logic_service_1.TagLogicService !== "undefined" && tag_logic_service_1.TagLogicService) === "function" ? _d : Object, typeof (_e = typeof vote_logic_service_1.VoteLogicService !== "undefined" && vote_logic_service_1.VoteLogicService) === "function" ? _e : Object, typeof (_f = typeof answer_logic_service_1.AnswerLogicService !== "undefined" && answer_logic_service_1.AnswerLogicService) === "function" ? _f : Object])
], PostProtectedController);


/***/ }),

/***/ "./apps/post-service/src/post/controllers/post-public.controller.ts":
/*!**************************************************************************!*\
  !*** ./apps/post-service/src/post/controllers/post-public.controller.ts ***!
  \**************************************************************************/
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
var PostPublicController_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostPublicController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const post_logic_service_1 = __webpack_require__(/*! ../services/logic/post-logic.service */ "./apps/post-service/src/post/services/logic/post-logic.service.ts");
const tag_logic_service_1 = __webpack_require__(/*! ../services/logic/tag-logic.service */ "./apps/post-service/src/post/services/logic/tag-logic.service.ts");
const answer_logic_service_1 = __webpack_require__(/*! ../services/logic/answer-logic.service */ "./apps/post-service/src/post/services/logic/answer-logic.service.ts");
const comment_logic_service_1 = __webpack_require__(/*! ../services/logic/comment-logic.service */ "./apps/post-service/src/post/services/logic/comment-logic.service.ts");
const post_1 = __webpack_require__(/*! @app/proto/post */ "./generated/post.ts");
const grpc_js_1 = __webpack_require__(/*! @grpc/grpc-js */ "@grpc/grpc-js");
let PostPublicController = PostPublicController_1 = class PostPublicController {
    constructor(postLogic, tagLogic, answerLogic, commentLogic) {
        this.postLogic = postLogic;
        this.tagLogic = tagLogic;
        this.answerLogic = answerLogic;
        this.commentLogic = commentLogic;
        this.logger = new common_1.Logger(PostPublicController_1.name);
    }
    async getPost(data) {
        try {
            this.logger.log(`Getting post: ${data.id}`);
            return await this.postLogic.getPost(data.id, data.userId);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getFeed(data) {
        try {
            this.logger.log(`Getting feed for user: ${data.userId}`);
            const result = await this.postLogic.getFeed(data.userId, { page: data.page, limit: data.limit });
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
            return await this.postLogic.getUserPosts(data.userId, { page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getTags(data) {
        try {
            this.logger.log(`Getting tags: page ${data.page}, limit ${data.limit}`);
            return await this.tagLogic.getTags({ page: data.page, limit: data.limit });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPopularTags(data) {
        try {
            this.logger.log(`Getting popular tags: limit ${data.limit}`);
            return await this.tagLogic.getPopularTags(data.limit || 5);
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostsByTag(data) {
        try {
            this.logger.log(`Getting posts by tag: ${data.tagName}`);
            return await this.tagLogic.getPostsByTag(data.tagName, {
                page: data.page,
                limit: data.limit
            });
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getQuestionAnswers(data) {
        try {
            this.logger.log(`Getting answers for question ${data.questionId}`);
            const answers = await this.answerLogic.getQuestionAnswers(data.questionId, data.userId);
            return { answers };
        }
        catch (error) {
            throw this.handleException(error);
        }
    }
    async getPostComments(data) {
        try {
            this.logger.log(`Getting comments for post: ${data.postId}`);
            return await this.commentLogic.getPostComments(data.postId, { page: data.page, limit: data.limit });
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
};
exports.PostPublicController = PostPublicController;
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPostById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getPost", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetFeed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getFeed", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetUserPosts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getUserPosts", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetTags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getTags", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPopularTags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getPopularTags", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetPostsByTag'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getPostsByTag", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetQuestionAnswers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getQuestionAnswers", null);
__decorate([
    (0, microservices_1.GrpcMethod)(post_1.POSTSERVICE_SERVICE_NAME, 'GetComments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostPublicController.prototype, "getPostComments", null);
exports.PostPublicController = PostPublicController = PostPublicController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof post_logic_service_1.PostLogicService !== "undefined" && post_logic_service_1.PostLogicService) === "function" ? _a : Object, typeof (_b = typeof tag_logic_service_1.TagLogicService !== "undefined" && tag_logic_service_1.TagLogicService) === "function" ? _b : Object, typeof (_c = typeof answer_logic_service_1.AnswerLogicService !== "undefined" && answer_logic_service_1.AnswerLogicService) === "function" ? _c : Object, typeof (_d = typeof comment_logic_service_1.CommentLogicService !== "undefined" && comment_logic_service_1.CommentLogicService) === "function" ? _d : Object])
], PostPublicController);


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
const post_public_controller_1 = __webpack_require__(/*! ./controllers/post-public.controller */ "./apps/post-service/src/post/controllers/post-public.controller.ts");
const post_protected_controller_1 = __webpack_require__(/*! ./controllers/post-protected.controller */ "./apps/post-service/src/post/controllers/post-protected.controller.ts");
const post_logic_service_1 = __webpack_require__(/*! ./services/logic/post-logic.service */ "./apps/post-service/src/post/services/logic/post-logic.service.ts");
const like_logic_service_1 = __webpack_require__(/*! ./services/logic/like-logic.service */ "./apps/post-service/src/post/services/logic/like-logic.service.ts");
const comment_logic_service_1 = __webpack_require__(/*! ./services/logic/comment-logic.service */ "./apps/post-service/src/post/services/logic/comment-logic.service.ts");
const tag_logic_service_1 = __webpack_require__(/*! ./services/logic/tag-logic.service */ "./apps/post-service/src/post/services/logic/tag-logic.service.ts");
const vote_logic_service_1 = __webpack_require__(/*! ./services/logic/vote-logic.service */ "./apps/post-service/src/post/services/logic/vote-logic.service.ts");
const answer_logic_service_1 = __webpack_require__(/*! ./services/logic/answer-logic.service */ "./apps/post-service/src/post/services/logic/answer-logic.service.ts");
const post_view_service_1 = __webpack_require__(/*! ./services/view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./apps/post-service/src/prisma/prisma.module.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const user_1 = __webpack_require__(/*! @app/proto/user */ "./generated/user.ts");
const auth_1 = __webpack_require__(/*! @app/proto/auth */ "./generated/auth.ts");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            common_2.GrpcModule.register({
                name: common_2.SERVICES.USER_SERVICE,
                package: user_1.USER_PACKAGE_NAME,
                protoFileName: 'user.proto',
                urlConfigKey: 'USER_SERVICE_URL',
                defaultUrl: 'localhost:50052',
            }),
            common_2.GrpcModule.register({
                name: common_2.SERVICES.AUTH_SERVICE,
                package: auth_1.AUTH_PACKAGE_NAME,
                protoFileName: 'auth.proto',
                urlConfigKey: 'AUTH_SERVICE_URL',
                defaultUrl: 'localhost:50051',
            }),
        ],
        controllers: [post_public_controller_1.PostPublicController, post_protected_controller_1.PostProtectedController],
        providers: [
            post_logic_service_1.PostLogicService,
            like_logic_service_1.LikeLogicService,
            comment_logic_service_1.CommentLogicService,
            tag_logic_service_1.TagLogicService,
            vote_logic_service_1.VoteLogicService,
            answer_logic_service_1.AnswerLogicService,
            post_view_service_1.PostViewService,
        ],
    })
], PostModule);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/answer-logic.service.ts":
/*!***************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/answer-logic.service.ts ***!
  \***************************************************************************/
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
var AnswerLogicService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnswerLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
const post_view_service_1 = __webpack_require__(/*! ../view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
let AnswerLogicService = AnswerLogicService_1 = class AnswerLogicService {
    constructor(prisma, rabbitClient, cacheManager, postViewService) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
        this.postViewService = postViewService;
        this.logger = new common_1.Logger(AnswerLogicService_1.name);
    }
    async createAnswer(questionId, userId, content) {
        const question = await this.prisma.post.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        const answer = await this.prisma.answer.create({
            data: {
                content,
                questionId,
                authorId: userId,
            },
        });
        this.rabbitClient.emit(common_2.EVENTS.COMMENT_CREATED, {
            answerId: answer.id,
            questionId,
            authorId: userId,
            content: answer.content,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
        await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(questionId)}:user:${userId}`);
        return answer;
    }
    async updateAnswer(answerId, userId, content) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        if (answer.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own answers');
        }
        const updatedAnswer = await this.prisma.answer.update({
            where: { id: answerId },
            data: { content },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
        return updatedAnswer;
    }
    async deleteAnswer(answerId, userId) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            include: { question: true },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        if (answer.authorId !== userId && answer.question.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own answers or answers to your questions');
        }
        await this.prisma.answer.delete({
            where: { id: answerId },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
        return { message: 'Answer deleted successfully' };
    }
    async acceptAnswer(answerId, userId) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            include: { question: true },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        if (answer.question.authorId !== userId) {
            throw new common_1.ForbiddenException('Only the question author can accept answers');
        }
        const existingAccepted = await this.prisma.answer.findFirst({
            where: {
                questionId: answer.questionId,
                isAccepted: true,
            },
        });
        if (existingAccepted && existingAccepted.id === answerId) {
            await this.prisma.answer.update({
                where: { id: answerId },
                data: { isAccepted: false },
            });
            await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
            await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
            return { message: 'Answer unaccepted', isAccepted: false };
        }
        if (existingAccepted) {
            await this.prisma.answer.update({
                where: { id: existingAccepted.id },
                data: { isAccepted: false },
            });
        }
        await this.prisma.answer.update({
            where: { id: answerId },
            data: { isAccepted: true },
        });
        this.rabbitClient.emit(common_2.EVENTS.COMMENT_CREATED, {
            answerId,
            questionId: answer.questionId,
            authorId: answer.authorId,
            isAccepted: true,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
        return { message: 'Answer accepted', isAccepted: true };
    }
    async voteAnswer(answerId, userId, voteType) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        if (answer.authorId === userId) {
            throw new common_1.BadRequestException('You cannot vote on your own answer');
        }
        const normalizedVoteType = voteType.toUpperCase();
        if (normalizedVoteType !== 'UP' && normalizedVoteType !== 'DOWN') {
            throw new common_1.BadRequestException('Invalid vote type. Must be "up" or "down"');
        }
        const existingVote = await this.prisma.answerVote.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId,
                },
            },
        });
        if (existingVote) {
            if (existingVote.voteType === normalizedVoteType) {
                await this.prisma.answerVote.delete({
                    where: { id: existingVote.id },
                });
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
                await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
                return { message: 'Vote removed', voteType: null };
            }
            await this.prisma.answerVote.update({
                where: { id: existingVote.id },
                data: { voteType: normalizedVoteType },
            });
            await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
            await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
            return { message: 'Vote updated', voteType: normalizedVoteType };
        }
        await this.prisma.answerVote.create({
            data: {
                answerId,
                userId,
                voteType: normalizedVoteType,
            },
        });
        this.rabbitClient.emit(common_2.EVENTS.COMMENT_CREATED, {
            answerId,
            questionId: answer.questionId,
            authorId: answer.authorId,
            voteType: normalizedVoteType,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
        return { message: 'Vote recorded', voteType: normalizedVoteType };
    }
    async getAnswerVotes(answerId, userId) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            include: {
                votes: true,
            },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        const upvotes = answer.votes.filter((v) => v.voteType === 'UP').length;
        const downvotes = answer.votes.filter((v) => v.voteType === 'DOWN').length;
        const totalVotes = upvotes - downvotes;
        let userVote = null;
        if (userId) {
            const vote = answer.votes.find((v) => v.userId === userId);
            if (vote) {
                userVote = vote.voteType === 'UP' ? 'up' : 'down';
            }
        }
        return {
            answerId,
            totalVotes,
            upvotes,
            downvotes,
            userVote,
        };
    }
    async getQuestionAnswers(questionId, userId) {
        const question = await this.prisma.post.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        const answers = await this.prisma.answer.findMany({
            where: { questionId },
            include: {
                votes: true,
                comments: {
                    where: { parentId: null },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: [
                { isAccepted: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        const answerAuthorIds = answers.map(a => a.authorId);
        const commentAuthorIds = answers.flatMap(a => a.comments.map((c) => c.authorId));
        const allAuthorIds = [...new Set([...answerAuthorIds, ...commentAuthorIds])];
        const authorsMap = new Map();
        await Promise.all(allAuthorIds.map(async (authorId) => {
            const author = await this.postViewService.getUserData(authorId);
            authorsMap.set(authorId, author);
        }));
        return answers.map((answer) => {
            const upvotes = answer.votes.filter((v) => v.voteType === 'UP').length;
            const downvotes = answer.votes.filter((v) => v.voteType === 'DOWN').length;
            const totalVotes = upvotes - downvotes;
            let userVote = null;
            if (userId) {
                const vote = answer.votes.find((v) => v.userId === userId);
                if (vote) {
                    userVote = vote.voteType === 'UP' ? 'up' : 'down';
                }
            }
            const author = authorsMap.get(answer.authorId);
            const comments = answer.comments.map((comment) => {
                const commentAuthor = authorsMap.get(comment.authorId);
                return {
                    id: comment.id,
                    content: comment.content,
                    userId: comment.authorId,
                    authorName: commentAuthor?.username || 'Unknown User',
                    authorAvatar: commentAuthor?.avatarUrl || '',
                    createdAt: comment.createdAt.toISOString(),
                };
            });
            return {
                id: answer.id,
                content: answer.content,
                authorId: answer.authorId,
                authorName: author?.username || 'Unknown User',
                authorAvatar: author?.avatarUrl || '',
                questionId: answer.questionId,
                isAccepted: answer.isAccepted,
                totalVotes,
                upvotes,
                downvotes,
                userVote,
                comments,
                commentCount: answer._count.comments,
                createdAt: answer.createdAt.toISOString(),
                updatedAt: answer.updatedAt.toISOString(),
            };
        });
    }
};
exports.AnswerLogicService = AnswerLogicService;
exports.AnswerLogicService = AnswerLogicService = AnswerLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('POST_SERVICE')),
    __param(2, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _c : Object, typeof (_d = typeof post_view_service_1.PostViewService !== "undefined" && post_view_service_1.PostViewService) === "function" ? _d : Object])
], AnswerLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/comment-logic.service.ts":
/*!****************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/comment-logic.service.ts ***!
  \****************************************************************************/
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
var CommentLogicService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
const post_view_service_1 = __webpack_require__(/*! ../view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
let CommentLogicService = CommentLogicService_1 = class CommentLogicService {
    constructor(prisma, rabbitClient, cacheManager, postViewService) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
        this.postViewService = postViewService;
        this.logger = new common_1.Logger(CommentLogicService_1.name);
    }
    async createComment(userId, createCommentDto) {
        if (createCommentDto.postId) {
            const post = await this.prisma.post.findUnique({
                where: { id: createCommentDto.postId },
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
        }
        else if (createCommentDto.answerId) {
            const answer = await this.prisma.answer.findUnique({
                where: { id: createCommentDto.answerId },
            });
            if (!answer) {
                throw new common_1.NotFoundException('Answer not found');
            }
        }
        else {
            throw new common_1.NotFoundException('Must provide either postId or answerId');
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
                postId: createCommentDto.postId,
                answerId: createCommentDto.answerId,
                authorId: userId,
                parentId: createCommentDto.parentId,
            },
        });
        if (createCommentDto.postId) {
            await this.cacheManager.del(common_2.CACHE_KEYS.POST(createCommentDto.postId));
            await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(createCommentDto.postId)}:user:${userId}`);
        }
        else if (createCommentDto.answerId) {
            const answer = await this.prisma.answer.findUnique({
                where: { id: createCommentDto.answerId },
            });
            if (answer) {
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(answer.questionId));
                await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
            }
        }
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
        const authorIds = [...new Set(comments.map(c => c.authorId))];
        const authorsMap = new Map();
        await Promise.all(authorIds.map(async (authorId) => {
            const author = await this.postViewService.getUserData(authorId);
            authorsMap.set(authorId, author);
        }));
        const formattedComments = comments.map(comment => {
            const author = authorsMap.get(comment.authorId);
            return {
                id: comment.id,
                postId: comment.postId,
                userId: comment.authorId,
                authorName: author?.username || 'Unknown User',
                authorAvatar: author?.avatarUrl || '',
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
            };
        });
        this.logger.log(`[getPostComments] Returning ${formattedComments.length} comments:`, JSON.stringify(formattedComments, null, 2));
        return {
            comments: formattedComments,
            total,
        };
    }
};
exports.CommentLogicService = CommentLogicService;
exports.CommentLogicService = CommentLogicService = CommentLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('POST_SERVICE')),
    __param(2, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _c : Object, typeof (_d = typeof post_view_service_1.PostViewService !== "undefined" && post_view_service_1.PostViewService) === "function" ? _d : Object])
], CommentLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/like-logic.service.ts":
/*!*************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/like-logic.service.ts ***!
  \*************************************************************************/
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
var LikeLogicService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LikeLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
let LikeLogicService = LikeLogicService_1 = class LikeLogicService {
    constructor(prisma, rabbitClient, cacheManager) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(LikeLogicService_1.name);
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
};
exports.LikeLogicService = LikeLogicService;
exports.LikeLogicService = LikeLogicService = LikeLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('POST_SERVICE')),
    __param(2, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _c : Object])
], LikeLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/post-logic.service.ts":
/*!*************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/post-logic.service.ts ***!
  \*************************************************************************/
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
var PostLogicService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
const post_view_service_1 = __webpack_require__(/*! ../view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
let PostLogicService = PostLogicService_1 = class PostLogicService {
    constructor(prisma, rabbitClient, cacheManager, viewService) {
        this.prisma = prisma;
        this.rabbitClient = rabbitClient;
        this.cacheManager = cacheManager;
        this.viewService = viewService;
        this.logger = new common_1.Logger(PostLogicService_1.name);
        this.prismaClient = this.prisma;
    }
    async createPost(userId, createPostDto) {
        const { tags, ...postData } = createPostDto;
        const post = await this.prisma.post.create({
            data: {
                ...postData,
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
        if (tags && tags.length > 0) {
            await this.handlePostTags(post.id, tags);
        }
        this.rabbitClient.emit(common_2.EVENTS.POST_CREATED, {
            postId: post.id,
            authorId: userId,
            content: post.content,
            createdAt: post.createdAt,
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(userId));
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(''));
        return await this.viewService.formatPostResponse(post);
    }
    async getPost(postId, userId) {
        const cacheKey = userId ? `${common_2.CACHE_KEYS.POST(postId)}:user:${userId}` : common_2.CACHE_KEYS.POST(postId);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const post = await this.prismaClient.post.findUnique({
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
                postTags: {
                    include: {
                        tag: true,
                    },
                },
                questionVotes: true,
                favoriteQuestions: userId ? {
                    where: { userId },
                } : false,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const result = await this.viewService.formatPostResponse(post, userId);
        await this.cacheManager.set(cacheKey, result, common_2.CACHE_TTL.MEDIUM);
        return result;
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
        return await this.viewService.formatPostResponse(updatedPost);
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
                            answers: true,
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
        const formattedPosts = await Promise.all(posts.map(post => this.viewService.formatPostResponse(post)));
        const result = {
            posts: formattedPosts,
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
        const formattedPosts = await Promise.all(posts.map(post => this.viewService.formatPostResponse(post)));
        return {
            posts: formattedPosts,
            total,
            page,
            limit,
        };
    }
    async handleUserDeleted(userId) {
        const posts = await this.prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
        });
        for (const post of posts) {
            await this.cacheManager.del(common_2.CACHE_KEYS.POST(post.id));
        }
        await this.prisma.post.deleteMany({
            where: { authorId: userId },
        });
        await this.cacheManager.del(common_2.CACHE_KEYS.USER_FEED(userId));
        this.logger.log(`Deleted all posts for user ${userId}`);
    }
    async handlePostTags(postId, tagNames) {
        for (const tagName of tagNames) {
            const normalizedTagName = tagName.trim().toLowerCase();
            let tag = await this.prismaClient.tag.findUnique({
                where: { name: normalizedTagName },
            });
            if (!tag) {
                tag = await this.prismaClient.tag.create({
                    data: {
                        name: normalizedTagName,
                        description: `Questions about ${normalizedTagName}`,
                    },
                });
            }
            await this.prismaClient.postTag.create({
                data: {
                    postId,
                    tagId: tag.id,
                },
            });
        }
    }
};
exports.PostLogicService = PostLogicService;
exports.PostLogicService = PostLogicService = PostLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('POST_SERVICE')),
    __param(2, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _c : Object, typeof (_d = typeof post_view_service_1.PostViewService !== "undefined" && post_view_service_1.PostViewService) === "function" ? _d : Object])
], PostLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/tag-logic.service.ts":
/*!************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/tag-logic.service.ts ***!
  \************************************************************************/
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
var TagLogicService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TagLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const post_view_service_1 = __webpack_require__(/*! ../view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
let TagLogicService = TagLogicService_1 = class TagLogicService {
    constructor(prisma, viewService) {
        this.prisma = prisma;
        this.viewService = viewService;
        this.logger = new common_1.Logger(TagLogicService_1.name);
        this.prismaClient = this.prisma;
    }
    async getTags(pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [tags, total] = await Promise.all([
            this.prismaClient.tag.findMany({
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            postTags: true,
                        },
                    },
                },
            }),
            this.prismaClient.tag.count(),
        ]);
        return {
            tags: tags.map(tag => ({
                id: tag.id,
                name: tag.name,
                description: tag.description || '',
                questionsCount: tag._count.postTags,
                createdAt: tag.createdAt.toISOString(),
            })),
            total,
        };
    }
    async getPopularTags(limit = 5) {
        const tags = await this.prismaClient.tag.findMany({
            take: limit,
            include: {
                _count: {
                    select: {
                        postTags: true,
                    },
                },
            },
            orderBy: {
                postTags: {
                    _count: 'desc',
                },
            },
        });
        return {
            tags: tags.map(tag => ({
                id: tag.id,
                name: tag.name,
                description: tag.description || '',
                questionsCount: tag._count.postTags,
                createdAt: tag.createdAt.toISOString(),
            })),
            total: tags.length,
        };
    }
    async getPostsByTag(tagName, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const tag = await this.prismaClient.tag.findFirst({
            where: {
                name: {
                    equals: tagName,
                    mode: 'insensitive',
                },
            },
        });
        if (!tag) {
            return {
                posts: [],
                total: 0,
                page,
                limit,
            };
        }
        const [postTags, total] = await Promise.all([
            this.prismaClient.postTag.findMany({
                where: { tagId: tag.id },
                skip,
                take: limit,
                include: {
                    post: {
                        include: {
                            _count: {
                                select: {
                                    likes: true,
                                    comments: true,
                                },
                            },
                            postTags: {
                                include: {
                                    tag: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    post: {
                        createdAt: 'desc',
                    },
                },
            }),
            this.prismaClient.postTag.count({
                where: { tagId: tag.id },
            }),
        ]);
        const posts = await Promise.all(postTags.map(async (pt) => await this.viewService.formatPostResponse(pt.post)));
        return {
            posts,
            total,
            page,
            limit,
        };
    }
    async createTag(name, description) {
        const existingTag = await this.prismaClient.tag.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
        });
        if (existingTag) {
            return {
                id: existingTag.id,
                name: existingTag.name,
                description: existingTag.description || '',
                questionsCount: 0,
                createdAt: existingTag.createdAt.toISOString(),
            };
        }
        const tag = await this.prismaClient.tag.create({
            data: {
                name: name.toLowerCase(),
                description,
            },
        });
        return {
            id: tag.id,
            name: tag.name,
            description: tag.description || '',
            questionsCount: 0,
            createdAt: tag.createdAt.toISOString(),
        };
    }
};
exports.TagLogicService = TagLogicService;
exports.TagLogicService = TagLogicService = TagLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof post_view_service_1.PostViewService !== "undefined" && post_view_service_1.PostViewService) === "function" ? _b : Object])
], TagLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/logic/vote-logic.service.ts":
/*!*************************************************************************!*\
  !*** ./apps/post-service/src/post/services/logic/vote-logic.service.ts ***!
  \*************************************************************************/
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
var VoteLogicService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VoteLogicService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./apps/post-service/src/prisma/prisma.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const cache_manager_1 = __webpack_require__(/*! cache-manager */ "cache-manager");
const cache_manager_2 = __webpack_require__(/*! @nestjs/cache-manager */ "@nestjs/cache-manager");
const post_view_service_1 = __webpack_require__(/*! ../view/post-view.service */ "./apps/post-service/src/post/services/view/post-view.service.ts");
let VoteLogicService = VoteLogicService_1 = class VoteLogicService {
    constructor(prisma, cacheManager, viewService) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
        this.viewService = viewService;
        this.logger = new common_1.Logger(VoteLogicService_1.name);
        this.prismaClient = this.prisma;
    }
    async voteQuestion(questionId, userId, voteType) {
        try {
            const post = await this.prismaClient.post.findUnique({
                where: { id: questionId },
            });
            if (!post) {
                throw new common_1.NotFoundException('Question not found');
            }
            const existingVote = await this.prismaClient.questionVote.findUnique({
                where: {
                    postId_userId: {
                        postId: questionId,
                        userId,
                    },
                },
            });
            const normalizedVoteType = voteType?.toUpperCase();
            if (existingVote && existingVote.voteType === normalizedVoteType) {
                await this.prismaClient.questionVote.delete({
                    where: { id: existingVote.id },
                });
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
                await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(questionId)}:user:${userId}`);
                return await this.getQuestionVotes(questionId, userId);
            }
            if (normalizedVoteType === 'UP' || normalizedVoteType === 'DOWN') {
                await this.prismaClient.questionVote.upsert({
                    where: {
                        postId_userId: {
                            postId: questionId,
                            userId,
                        },
                    },
                    create: {
                        postId: questionId,
                        userId,
                        voteType: normalizedVoteType,
                    },
                    update: {
                        voteType: normalizedVoteType,
                        updatedAt: new Date(),
                    },
                });
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
                await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(questionId)}:user:${userId}`);
                return await this.getQuestionVotes(questionId, userId);
            }
            throw new Error('Invalid vote type. Must be "up" or "down"');
        }
        catch (error) {
            this.logger.error(`Failed to vote on question ${questionId}:`, error);
            throw error;
        }
    }
    async getQuestionVotes(questionId, userId) {
        try {
            const [upvotes, downvotes, userVote] = await Promise.all([
                this.prismaClient.questionVote.count({
                    where: {
                        postId: questionId,
                        voteType: 'UP',
                    },
                }),
                this.prismaClient.questionVote.count({
                    where: {
                        postId: questionId,
                        voteType: 'DOWN',
                    },
                }),
                userId
                    ? this.prismaClient.questionVote.findUnique({
                        where: {
                            postId_userId: {
                                postId: questionId,
                                userId,
                            },
                        },
                    })
                    : null,
            ]);
            return {
                success: true,
                upvotes,
                downvotes,
                totalVotes: upvotes - downvotes,
                userVote: userVote ? userVote.voteType.toLowerCase() : null,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get votes for question ${questionId}:`, error);
            throw error;
        }
    }
    async favoriteQuestion(questionId, userId, listName) {
        try {
            const post = await this.prismaClient.post.findUnique({
                where: { id: questionId },
            });
            if (!post) {
                throw new common_1.NotFoundException('Question not found');
            }
            const effectiveListName = listName || 'default';
            const existingFavorite = await this.prismaClient.favoriteQuestion.findUnique({
                where: {
                    postId_userId: {
                        postId: questionId,
                        userId,
                    },
                },
            });
            if (existingFavorite) {
                await this.prismaClient.favoriteQuestion.delete({
                    where: { id: existingFavorite.id },
                });
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
                await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(questionId)}:user:${userId}`);
                return {
                    success: true,
                    isFavorited: false,
                };
            }
            await this.prismaClient.favoriteQuestion.create({
                data: {
                    postId: questionId,
                    userId,
                    listName: effectiveListName,
                },
            });
            await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
            await this.cacheManager.del(`${common_2.CACHE_KEYS.POST(questionId)}:user:${userId}`);
            return {
                success: true,
                isFavorited: true,
            };
        }
        catch (error) {
            this.logger.error(`Failed to favorite question ${questionId}:`, error);
            throw error;
        }
    }
    async unfavoriteQuestion(questionId, userId) {
        try {
            const favorite = await this.prismaClient.favoriteQuestion.findUnique({
                where: {
                    postId_userId: {
                        postId: questionId,
                        userId,
                    },
                },
            });
            if (favorite) {
                await this.prismaClient.favoriteQuestion.delete({
                    where: { id: favorite.id },
                });
                await this.cacheManager.del(common_2.CACHE_KEYS.POST(questionId));
            }
            return {
                success: true,
                isFavorited: false,
            };
        }
        catch (error) {
            this.logger.error(`Failed to unfavorite question ${questionId}:`, error);
            throw error;
        }
    }
    async getUserFavorites(userId, listName, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (listName) {
                where.listName = listName;
            }
            const [favorites, total] = await Promise.all([
                this.prismaClient.favoriteQuestion.findMany({
                    where,
                    include: {
                        post: {
                            include: {
                                _count: {
                                    select: {
                                        likes: true,
                                        comments: true,
                                        questionVotes: true,
                                    },
                                },
                                postTags: {
                                    include: {
                                        tag: true,
                                    },
                                },
                                questionVotes: {
                                    where: { userId },
                                },
                                favoriteQuestions: {
                                    where: { userId },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
                this.prismaClient.favoriteQuestion.count({ where }),
            ]);
            const formattedFavorites = await Promise.all(favorites.map(async (favorite) => ({
                id: favorite.id,
                questionId: favorite.postId,
                listName: favorite.listName || 'default',
                createdAt: favorite.createdAt.toISOString(),
                question: await this.viewService.formatPostResponse(favorite.post),
            })));
            return {
                favorites: formattedFavorites,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get favorites for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.VoteLogicService = VoteLogicService;
exports.VoteLogicService = VoteLogicService = VoteLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_2.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _b : Object, typeof (_c = typeof post_view_service_1.PostViewService !== "undefined" && post_view_service_1.PostViewService) === "function" ? _c : Object])
], VoteLogicService);


/***/ }),

/***/ "./apps/post-service/src/post/services/view/post-view.service.ts":
/*!***********************************************************************!*\
  !*** ./apps/post-service/src/post/services/view/post-view.service.ts ***!
  \***********************************************************************/
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
var PostViewService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostViewService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const auth_1 = __webpack_require__(/*! @app/proto/auth */ "./generated/auth.ts");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let PostViewService = PostViewService_1 = class PostViewService {
    constructor(authClient) {
        this.authClient = authClient;
        this.logger = new common_1.Logger(PostViewService_1.name);
        this.logger.log('📦 PostViewService constructor called');
    }
    onModuleInit() {
        this.logger.log('🔧 PostViewService onModuleInit - Initializing auth service...');
        try {
            this.authService = this.authClient.getService(auth_1.AUTHSERVICE_SERVICE_NAME);
            this.logger.log('✅ Auth service obtained from client');
        }
        catch (error) {
            this.logger.error(`❌ Failed to get auth service: ${error.message}`, error.stack);
        }
    }
    getAuthService() {
        if (!this.authService) {
            this.logger.log('⚡ Lazy initialization of auth service');
            this.authService = this.authClient.getService(auth_1.AUTHSERVICE_SERVICE_NAME);
        }
        return this.authService;
    }
    async getUserData(userId) {
        this.logger.log(`[getUserData] 🔍 Fetching user data for: ${userId}`);
        try {
            const authSvc = this.getAuthService();
            this.logger.log(`[getUserData] 📞 Calling auth service GetUserById...`);
            const user = await (0, rxjs_1.lastValueFrom)(authSvc.GetUserById({ id: userId }));
            this.logger.log(`[getUserData] ✅ Received user data:`, {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            let displayName = user.username || 'User';
            if (user.firstName || user.lastName) {
                displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
            }
            this.logger.log(`[getUserData] ✅ Constructed display name: "${displayName}"`);
            return {
                id: user.id,
                email: user.email,
                username: displayName,
                bio: '',
                avatarUrl: user.profileImage || '',
            };
        }
        catch (error) {
            this.logger.error(`[getUserData] ❌ Error fetching user ${userId}:`, error.message);
            this.logger.error(`[getUserData] Stack:`, error.stack);
            return {
                id: userId,
                email: 'unavailable@example.com',
                username: 'User',
                bio: '',
                avatarUrl: '',
            };
        }
    }
    async formatPostResponse(post, userId) {
        const authorData = await this.getUserData(post.authorId);
        const author = {
            id: authorData.id,
            name: authorData.username || 'Anonymous',
            reputation: 0,
            avatar: authorData.avatarUrl || '',
        };
        const tags = post.postTags?.map((pt) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            description: pt.tag.description || '',
            questionsCount: 0,
            createdAt: pt.tag.createdAt.toISOString(),
        })) || [];
        let upvotes = 0;
        let downvotes = 0;
        let userVote = null;
        if (post.questionVotes) {
            upvotes = post.questionVotes.filter((v) => v.voteType === 'UP').length;
            downvotes = post.questionVotes.filter((v) => v.voteType === 'DOWN').length;
            if (userId) {
                const vote = post.questionVotes.find((v) => v.userId === userId);
                if (vote) {
                    userVote = vote.voteType === 'UP' ? 'up' : vote.voteType === 'DOWN' ? 'down' : null;
                }
            }
        }
        let isFavorited = false;
        if (post.favoriteQuestions && userId) {
            isFavorited = post.favoriteQuestions.some((fq) => fq.userId === userId);
        }
        return {
            id: post.id,
            userId: post.authorId,
            content: post.content,
            mediaUrls: post.mediaUrls || [],
            likesCount: post._count?.likes || 0,
            commentsCount: post._count?.comments || 0,
            answersCount: post._count?.answers || 0,
            visibility: post.privacy,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            author: author,
            tags: tags,
            upvotes,
            downvotes,
            totalVotes: upvotes - downvotes,
            userVote: userVote || undefined,
            isFavorited,
        };
    }
};
exports.PostViewService = PostViewService;
exports.PostViewService = PostViewService = PostViewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.AUTH_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], PostViewService);


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

/***/ "./generated/auth.ts":
/*!***************************!*\
  !*** ./generated/auth.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AUTHSERVICE_SERVICE_NAME = exports.AUTH_PACKAGE_NAME = void 0;
exports.AUTH_PACKAGE_NAME = 'auth';
exports.AUTHSERVICE_SERVICE_NAME = 'AuthService';


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

/***/ "./generated/user.ts":
/*!***************************!*\
  !*** ./generated/user.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.USERSERVICE_SERVICE_NAME = exports.USER_PACKAGE_NAME = void 0;
exports.USER_PACKAGE_NAME = 'user';
exports.USERSERVICE_SERVICE_NAME = 'UserService';


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

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

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