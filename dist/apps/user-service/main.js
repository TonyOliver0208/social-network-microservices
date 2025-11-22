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
const user_public_controller_1 = __webpack_require__(6);
const user_protected_controller_1 = __webpack_require__(16);
const profile_logic_service_1 = __webpack_require__(7);
const follow_logic_service_1 = __webpack_require__(11);
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
        controllers: [user_public_controller_1.UserPublicController, user_protected_controller_1.UserProtectedController],
        providers: [profile_logic_service_1.ProfileLogicService, follow_logic_service_1.FollowLogicService, prisma_service_1.PrismaService],
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
var UserPublicController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserPublicController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const profile_logic_service_1 = __webpack_require__(7);
const follow_logic_service_1 = __webpack_require__(11);
const dto_1 = __webpack_require__(12);
const user_1 = __webpack_require__(14);
const grpc_js_1 = __webpack_require__(15);
let UserPublicController = UserPublicController_1 = class UserPublicController {
    constructor(profileLogic, followLogic) {
        this.profileLogic = profileLogic;
        this.followLogic = followLogic;
        this.logger = new common_1.Logger(UserPublicController_1.name);
    }
    async getProfile(payload) {
        this.logger.log(`Getting profile for user: ${payload.userId}`);
        const result = await this.profileLogic.getProfile(payload.userId);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async getFollowers(payload) {
        this.logger.log(`Getting followers for user: ${payload.userId}`);
        const result = await this.followLogic.getFollowers(payload.userId, payload.page, payload.limit);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async getFollowing(payload) {
        this.logger.log(`Getting following for user: ${payload.userId}`);
        const result = await this.followLogic.getFollowing(payload.userId, payload.page, payload.limit);
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
        this.logger.log(`Searching users: ${payload.query}`);
        const result = await this.profileLogic.searchUsers(payload.query, payload.page, payload.limit);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async findById(payload) {
        this.logger.log(`Finding user by ID: ${payload.userId}`);
        const result = await this.profileLogic.getProfile(payload.userId);
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
        if (error?.includes('already exists')) {
            return grpc_js_1.status.ALREADY_EXISTS;
        }
        if (error?.includes('invalid') || error?.includes('Cannot')) {
            return grpc_js_1.status.INVALID_ARGUMENT;
        }
        switch (httpStatusCode) {
            case 404:
                return grpc_js_1.status.NOT_FOUND;
            case 400:
                return grpc_js_1.status.INVALID_ARGUMENT;
            default:
                return grpc_js_1.status.UNKNOWN;
        }
    }
};
exports.UserPublicController = UserPublicController;
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetProfile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.GetUserDto !== "undefined" && dto_1.GetUserDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UserPublicController.prototype, "getProfile", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetFollowers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPublicController.prototype, "getFollowers", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetFollowing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPublicController.prototype, "getFollowing", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'SearchUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPublicController.prototype, "searchUsers", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'GetUserById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPublicController.prototype, "findById", null);
exports.UserPublicController = UserPublicController = UserPublicController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof profile_logic_service_1.ProfileLogicService !== "undefined" && profile_logic_service_1.ProfileLogicService) === "function" ? _a : Object, typeof (_b = typeof follow_logic_service_1.FollowLogicService !== "undefined" && follow_logic_service_1.FollowLogicService) === "function" ? _b : Object])
], UserPublicController);


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
var ProfileLogicService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfileLogicService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
const common_2 = __webpack_require__(10);
let ProfileLogicService = ProfileLogicService_1 = class ProfileLogicService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProfileLogicService_1.name);
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
exports.ProfileLogicService = ProfileLogicService;
exports.ProfileLogicService = ProfileLogicService = ProfileLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ProfileLogicService);


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
const client_user_1 = __webpack_require__(9);
let PrismaService = class PrismaService extends client_user_1.PrismaClient {
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

module.exports = require(".prisma/client-user");

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
var FollowLogicService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FollowLogicService = void 0;
const common_1 = __webpack_require__(3);
const prisma_service_1 = __webpack_require__(8);
const common_2 = __webpack_require__(10);
let FollowLogicService = FollowLogicService_1 = class FollowLogicService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FollowLogicService_1.name);
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
};
exports.FollowLogicService = FollowLogicService;
exports.FollowLogicService = FollowLogicService = FollowLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], FollowLogicService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUserDto = exports.FollowUserDto = exports.UpdateProfileDto = void 0;
const class_validator_1 = __webpack_require__(13);
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
/* 13 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.USERSERVICE_SERVICE_NAME = exports.USER_PACKAGE_NAME = void 0;
exports.USER_PACKAGE_NAME = 'user';
exports.USERSERVICE_SERVICE_NAME = 'UserService';


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 16 */
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
var UserProtectedController_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserProtectedController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const profile_logic_service_1 = __webpack_require__(7);
const follow_logic_service_1 = __webpack_require__(11);
const dto_1 = __webpack_require__(12);
const common_2 = __webpack_require__(10);
const user_1 = __webpack_require__(14);
const grpc_js_1 = __webpack_require__(15);
let UserProtectedController = UserProtectedController_1 = class UserProtectedController {
    constructor(profileLogic, followLogic) {
        this.profileLogic = profileLogic;
        this.followLogic = followLogic;
        this.logger = new common_1.Logger(UserProtectedController_1.name);
    }
    async updateProfile(payload) {
        this.logger.log(`Updating profile for user: ${payload.userId}`);
        const result = await this.profileLogic.updateProfile(payload.userId, payload.data);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async followUser(payload) {
        this.logger.log(`User ${payload.followerId} following ${payload.followingId}`);
        const result = await this.followLogic.followUser(payload.followerId, payload.followingId);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async unfollowUser(payload) {
        this.logger.log(`User ${payload.followerId} unfollowing ${payload.followingId}`);
        const result = await this.followLogic.unfollowUser(payload.followerId, payload.followingId);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async handleUserRegistered(data) {
        this.logger.log(`Creating profile for registered user: ${data.userId}`);
        await this.profileLogic.createUserProfile(data.userId, data.email, data.username);
    }
    async handlePostCreated(data) {
        this.logger.log(`Handling post created event by user: ${data.userId}`);
    }
    async handlePostDeleted(data) {
        this.logger.log(`Handling post deleted event by user: ${data.userId}`);
    }
    getGrpcStatusCode(error, httpStatusCode) {
        if (error?.includes('not found')) {
            return grpc_js_1.status.NOT_FOUND;
        }
        if (error?.includes('already exists')) {
            return grpc_js_1.status.ALREADY_EXISTS;
        }
        if (error?.includes('invalid') || error?.includes('Cannot')) {
            return grpc_js_1.status.INVALID_ARGUMENT;
        }
        switch (httpStatusCode) {
            case 404:
                return grpc_js_1.status.NOT_FOUND;
            case 400:
                return grpc_js_1.status.INVALID_ARGUMENT;
            default:
                return grpc_js_1.status.UNKNOWN;
        }
    }
};
exports.UserProtectedController = UserProtectedController;
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'UpdateProfile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "updateProfile", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'FollowUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.FollowUserDto !== "undefined" && dto_1.FollowUserDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "followUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)(user_1.USERSERVICE_SERVICE_NAME, 'UnfollowUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.FollowUserDto !== "undefined" && dto_1.FollowUserDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "unfollowUser", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_REGISTERED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "handleUserRegistered", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_CREATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "handlePostCreated", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProtectedController.prototype, "handlePostDeleted", null);
exports.UserProtectedController = UserProtectedController = UserProtectedController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof profile_logic_service_1.ProfileLogicService !== "undefined" && profile_logic_service_1.ProfileLogicService) === "function" ? _a : Object, typeof (_b = typeof follow_logic_service_1.FollowLogicService !== "undefined" && follow_logic_service_1.FollowLogicService) === "function" ? _b : Object])
], UserProtectedController);


/***/ }),
/* 17 */
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
const path_1 = __webpack_require__(17);
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