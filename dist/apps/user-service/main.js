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
const user_controller_1 = __webpack_require__(6);
const user_service_1 = __webpack_require__(7);
const prisma_service_1 = __webpack_require__(8);
const common_2 = __webpack_require__(10);
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
            common_2.RedisModule.register(),
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService, prisma_service_1.PrismaService],
    })
], AppModule);


/***/ }),
/* 6 */
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
var UserController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const user_service_1 = __webpack_require__(7);
const common_2 = __webpack_require__(10);
const dto_1 = __webpack_require__(11);
const user_1 = __webpack_require__(13);
let UserController = UserController_1 = class UserController {
    constructor(userService) {
        this.userService = userService;
        this.logger = new common_1.Logger(UserController_1.name);
    }
    async getProfile(payload) {
        this.logger.log(`Getting profile for user: ${payload.userId}`);
        return this.userService.getProfile(payload.userId);
    }
    async updateProfile(payload) {
        this.logger.log(`Updating profile for user: ${payload.userId}`);
        return this.userService.updateProfile(payload.userId, payload.data);
    }
    async followUser(payload) {
        this.logger.log(`User ${payload.followerId} following ${payload.followingId}`);
        return this.userService.followUser(payload.followerId, payload.followingId);
    }
    async unfollowUser(payload) {
        this.logger.log(`User ${payload.followerId} unfollowing ${payload.followingId}`);
        return this.userService.unfollowUser(payload.followerId, payload.followingId);
    }
    async getFollowers(payload) {
        this.logger.log(`Getting followers for user: ${payload.userId}`);
        return this.userService.getFollowers(payload.userId, payload.page, payload.limit);
    }
    async getFollowing(payload) {
        this.logger.log(`Getting following for user: ${payload.userId}`);
        return this.userService.getFollowing(payload.userId, payload.page, payload.limit);
    }
    async searchUsers(payload) {
        this.logger.log(`Searching users with query: ${payload.query}`);
        return this.userService.searchUsers(payload.query, payload.page, payload.limit);
    }
    async findById(payload) {
        this.logger.log(`Finding user by ID: ${payload.userId}`);
        return this.userService.getProfile(payload.userId);
    }
    async handleUserRegistered(data) {
        this.logger.log(`Handling user registered event: ${data.userId}`);
        await this.userService.createUserProfile(data.userId, data.email, data.username);
    }
    async handlePostCreated(data) {
        this.logger.log(`Handling post created event by user: ${data.userId}`);
    }
    async handlePostDeleted(data) {
        this.logger.log(`Handling post deleted event by user: ${data.userId}`);
    }
};
exports.UserController = UserController;
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetProfile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof dto_1.GetUserDto !== "undefined" && dto_1.GetUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'UpdateProfile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'FollowUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof dto_1.FollowUserDto !== "undefined" && dto_1.FollowUserDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], UserController.prototype, "followUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'UnfollowUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof dto_1.FollowUserDto !== "undefined" && dto_1.FollowUserDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserController.prototype, "unfollowUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetFollowers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], UserController.prototype, "getFollowers", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetFollowing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], UserController.prototype, "getFollowing", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetUserById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], UserController.prototype, "searchUsers", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetUserById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], UserController.prototype, "findById", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_REGISTERED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "handleUserRegistered", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_CREATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "handlePostCreated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "handlePostDeleted", null);
exports.UserController = UserController = UserController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object])
], UserController);


/***/ }),
/* 7 */
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
var UserService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
const common_2 = __webpack_require__(10);
let UserService = UserService_1 = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async createUserProfile(userId, email, username) {
        try {
            await this.prisma.$transaction([
                this.prisma.profile.create({
                    data: {
                        userId,
                        fullName: username,
                    },
                }),
                this.prisma.userStats.create({
                    data: {
                        userId,
                        followersCount: 0,
                        followingCount: 0,
                        postsCount: 0,
                    },
                }),
            ]);
            this.logger.log(`Created profile and stats for user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create profile: ${error.message}`);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const profile = await this.prisma.profile.findUnique({
                where: { userId },
            });
            if (!profile) {
                throw new common_1.NotFoundException('Profile not found');
            }
            const stats = await this.prisma.userStats.findUnique({
                where: { userId },
            });
            return {
                success: true,
                data: {
                    ...profile,
                    stats,
                },
            };
        }
        catch (error) {
            this.logger.error(`Get profile error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async updateProfile(userId, data) {
        try {
            const profile = await this.prisma.profile.update({
                where: { userId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Updated profile for user: ${userId}`);
            return {
                success: true,
                data: profile,
                message: 'Profile updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Update profile error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async followUser(followerId, followingId) {
        try {
            if (followerId === followingId) {
                throw new common_1.BadRequestException('Cannot follow yourself');
            }
            const existing = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('Already following this user');
            }
            await this.prisma.$transaction([
                this.prisma.follow.create({
                    data: {
                        followerId,
                        followingId,
                    },
                }),
                this.prisma.userStats.update({
                    where: { userId: followerId },
                    data: { followingCount: { increment: 1 } },
                }),
                this.prisma.userStats.update({
                    where: { userId: followingId },
                    data: { followersCount: { increment: 1 } },
                }),
            ]);
            this.logger.log(`User ${followerId} followed ${followingId}`);
            return {
                success: true,
                message: 'Followed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Follow error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async unfollowUser(followerId, followingId) {
        try {
            const follow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            if (!follow) {
                throw new common_1.NotFoundException('Not following this user');
            }
            await this.prisma.$transaction([
                this.prisma.follow.delete({
                    where: { id: follow.id },
                }),
                this.prisma.userStats.update({
                    where: { userId: followerId },
                    data: { followingCount: { decrement: 1 } },
                }),
                this.prisma.userStats.update({
                    where: { userId: followingId },
                    data: { followersCount: { decrement: 1 } },
                }),
            ]);
            this.logger.log(`User ${followerId} unfollowed ${followingId}`);
            return {
                success: true,
                message: 'Unfollowed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Unfollow error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async getFollowers(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [followers, total] = await Promise.all([
                this.prisma.follow.findMany({
                    where: { followingId: userId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        followerId: true,
                        createdAt: true,
                    },
                }),
                this.prisma.follow.count({
                    where: { followingId: userId },
                }),
            ]);
            return {
                success: true,
                data: followers,
                pagination: (0, common_2.calculatePagination)(page, limit, total),
            };
        }
        catch (error) {
            this.logger.error(`Get followers error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: 500,
            };
        }
    }
    async getFollowing(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [following, total] = await Promise.all([
                this.prisma.follow.findMany({
                    where: { followerId: userId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        followingId: true,
                        createdAt: true,
                    },
                }),
                this.prisma.follow.count({
                    where: { followerId: userId },
                }),
            ]);
            return {
                success: true,
                data: following,
                pagination: (0, common_2.calculatePagination)(page, limit, total),
            };
        }
        catch (error) {
            this.logger.error(`Get following error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: 500,
            };
        }
    }
    async searchUsers(query, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                this.prisma.profile.findMany({
                    where: {
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { bio: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    skip,
                    take: limit,
                    select: {
                        userId: true,
                        fullName: true,
                        avatar: true,
                        bio: true,
                    },
                }),
                this.prisma.profile.count({
                    where: {
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { bio: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                }),
            ]);
            return {
                success: true,
                data: users,
                pagination: (0, common_2.calculatePagination)(page, limit, total),
            };
        }
        catch (error) {
            this.logger.error(`Search users error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: 500,
            };
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], UserService);


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
const client_1 = __webpack_require__(9);
let PrismaService = class PrismaService extends client_1.PrismaClient {
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

module.exports = require("@prisma/client");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@app/common");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUserDto = exports.FollowUserDto = exports.UpdateProfileDto = void 0;
const class_validator_1 = __webpack_require__(12);
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateProfileDto.prototype, "isPrivate", void 0);
class FollowUserDto {
}
exports.FollowUserDto = FollowUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FollowUserDto.prototype, "followerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FollowUserDto.prototype, "followingId", void 0);
class GetUserDto {
}
exports.GetUserDto = GetUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetUserDto.prototype, "userId", void 0);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.USERSERVICE_SERVICE_NAME = exports.USER_PACKAGE_NAME = void 0;
exports.USER_PACKAGE_NAME = 'user';
exports.USERSERVICE_SERVICE_NAME = 'UserService';


/***/ }),
/* 14 */
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
const path_1 = __webpack_require__(14);
async function bootstrap() {
    const logger = new common_1.Logger('UserService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('USER_SERVICE_PORT', 50052);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${port}`,
            package: 'user',
            protoPath: (0, path_1.join)(__dirname, '..', '..', '..', 'proto', 'user.proto'),
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
            queue: 'user_queue',
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
    logger.log(`👥 User Service (gRPC) is running on port ${port}`);
    logger.log(`📨 User Service (RabbitMQ) connected to user_queue`);
}
bootstrap();

})();

/******/ })()
;