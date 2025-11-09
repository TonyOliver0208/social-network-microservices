/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/media-service/src/app.module.ts":
/*!**********************************************!*\
  !*** ./apps/media-service/src/app.module.ts ***!
  \**********************************************/
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
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const media_module_1 = __webpack_require__(/*! ./media/media.module */ "./apps/media-service/src/media/media.module.ts");
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
                    uri: configService.get('MEDIA_MONGODB_URI') || 'mongodb://localhost:27017/devcoll_media',
                }),
                inject: [config_1.ConfigService],
            }),
            media_module_1.MediaModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/media-service/src/media/cloudinary.service.ts":
/*!************************************************************!*\
  !*** ./apps/media-service/src/media/cloudinary.service.ts ***!
  \************************************************************/
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
var CloudinaryService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CloudinaryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const cloudinary_1 = __webpack_require__(/*! cloudinary */ "cloudinary");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.error('Cloudinary credentials not found in environment variables!');
            this.logger.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
            throw new Error('Cloudinary configuration missing');
        }
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
        this.logger.log(`Cloudinary configured successfully for cloud: ${cloudName}`);
    }
    async uploadImage(file, folder = 'devcoll') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                resource_type: 'auto',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            }, (error, result) => {
                if (error) {
                    this.logger.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                this.logger.log(`Image uploaded successfully: ${result.secure_url}`);
                resolve(result);
            });
            uploadStream.end(file.buffer);
        });
    }
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            this.logger.log(`Image deleted: ${publicId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting image ${publicId}:`, error);
            throw error;
        }
    }
    async uploadMultipleImages(files, folder = 'devcoll') {
        const uploadPromises = files.map((file) => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }
    getOptimizedUrl(publicId, width, height) {
        return cloudinary_1.v2.url(publicId, {
            width: width || 800,
            height: height || 600,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], CloudinaryService);


/***/ }),

/***/ "./apps/media-service/src/media/media.controller.ts":
/*!**********************************************************!*\
  !*** ./apps/media-service/src/media/media.controller.ts ***!
  \**********************************************************/
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
var MediaController_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const media_service_1 = __webpack_require__(/*! ./media.service */ "./apps/media-service/src/media/media.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const media_1 = __webpack_require__(/*! @app/proto/media */ "./generated/media.ts");
const grpc_js_1 = __webpack_require__(/*! @grpc/grpc-js */ "@grpc/grpc-js");
let MediaController = MediaController_1 = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(MediaController_1.name);
    }
    async uploadMedia(payload) {
        this.logger.log(`Upload media request from user: ${payload.userId}, file: ${payload.filename}`);
        const fileBuffer = Buffer.from(payload.file);
        const fileObject = {
            buffer: fileBuffer,
            originalname: payload.filename,
            mimetype: payload.mimetype,
            size: fileBuffer.length,
        };
        const result = await this.mediaService.uploadFile(payload.userId, fileObject);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async deleteMedia(payload) {
        this.logger.log(`Delete media request: ${payload.id} by user: ${payload.userId}`);
        const result = await this.mediaService.deleteFile(payload.id, payload.userId);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async findMediaById(payload) {
        this.logger.log(`Find media by ID: ${payload.id}`);
        const result = await this.mediaService.findById(payload.id);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return result.data;
    }
    async getUserMedia(payload) {
        this.logger.log(`Get media for user: ${payload.userId}`);
        const result = await this.mediaService.getUserMedia(payload.userId, payload.type, payload.page, payload.limit);
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
        if (error?.includes('Unauthorized')) {
            return grpc_js_1.status.UNAUTHENTICATED;
        }
        if (error?.includes('forbidden') || error?.includes('permission') || error?.includes('only')) {
            return grpc_js_1.status.PERMISSION_DENIED;
        }
        if (error?.includes('invalid') || error?.includes('validation') || error?.includes('too large') || error?.includes('type not supported')) {
            return grpc_js_1.status.INVALID_ARGUMENT;
        }
        if (error?.includes('quota') || error?.includes('limit exceeded')) {
            return grpc_js_1.status.RESOURCE_EXHAUSTED;
        }
        switch (httpStatusCode) {
            case 404:
                return grpc_js_1.status.NOT_FOUND;
            case 401:
                return grpc_js_1.status.UNAUTHENTICATED;
            case 403:
                return grpc_js_1.status.PERMISSION_DENIED;
            case 400:
                return grpc_js_1.status.INVALID_ARGUMENT;
            case 429:
                return grpc_js_1.status.RESOURCE_EXHAUSTED;
            default:
                return grpc_js_1.status.UNKNOWN;
        }
    }
    async handleUserDeleted(data) {
        this.logger.log(`Handling user deleted event for media: ${data.userId}`);
        await this.mediaService.deleteUserMedia(data.userId);
    }
    async handlePostDeleted(data) {
        this.logger.log(`Handling post deleted event: ${data.postId}`);
        if (data.mediaUrls && data.mediaUrls.length > 0) {
        }
    }
    async handlePostCreated(data) {
        this.logger.log(`Handling post created event with media: ${data.postId}`);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'UploadMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMedia", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'DeleteMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'GetMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findMediaById", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'GetUserMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getUserMedia", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "handleUserDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "handlePostDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.POST_CREATED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "handlePostCreated", null);
exports.MediaController = MediaController = MediaController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof media_service_1.MediaService !== "undefined" && media_service_1.MediaService) === "function" ? _a : Object])
], MediaController);


/***/ }),

/***/ "./apps/media-service/src/media/media.module.ts":
/*!******************************************************!*\
  !*** ./apps/media-service/src/media/media.module.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const media_controller_1 = __webpack_require__(/*! ./media.controller */ "./apps/media-service/src/media/media.controller.ts");
const media_service_1 = __webpack_require__(/*! ./media.service */ "./apps/media-service/src/media/media.service.ts");
const cloudinary_service_1 = __webpack_require__(/*! ./cloudinary.service */ "./apps/media-service/src/media/cloudinary.service.ts");
const media_schema_1 = __webpack_require__(/*! ./schemas/media.schema */ "./apps/media-service/src/media/schemas/media.schema.ts");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([{ name: media_schema_1.Media.name, schema: media_schema_1.MediaSchema }]),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService, cloudinary_service_1.CloudinaryService],
        exports: [media_service_1.MediaService, cloudinary_service_1.CloudinaryService],
    })
], MediaModule);


/***/ }),

/***/ "./apps/media-service/src/media/media.service.ts":
/*!*******************************************************!*\
  !*** ./apps/media-service/src/media/media.service.ts ***!
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
var MediaService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const media_schema_1 = __webpack_require__(/*! ./schemas/media.schema */ "./apps/media-service/src/media/schemas/media.schema.ts");
const cloudinary_service_1 = __webpack_require__(/*! ./cloudinary.service */ "./apps/media-service/src/media/cloudinary.service.ts");
let MediaService = MediaService_1 = class MediaService {
    constructor(mediaModel, cloudinaryService) {
        this.mediaModel = mediaModel;
        this.cloudinaryService = cloudinaryService;
        this.logger = new common_1.Logger(MediaService_1.name);
    }
    getFileType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        if (mimeType.includes('pdf') || mimeType.includes('document'))
            return 'document';
        return 'other';
    }
    async uploadFile(userId, file) {
        try {
            const uploadResult = await this.cloudinaryService.uploadImage(file, 'devcoll/posts');
            const media = await this.mediaModel.create({
                userId,
                filename: uploadResult.public_id,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: uploadResult.secure_url,
                type: this.getFileType(file.mimetype),
                storage: 'cloudinary',
                cloudinaryPublicId: uploadResult.public_id,
                isActive: true,
            });
            this.logger.log(`Media uploaded successfully to Cloudinary: ${media._id}`);
            return {
                success: true,
                data: {
                    id: media._id,
                    url: media.url,
                    type: media.type,
                    filename: media.filename,
                    publicId: uploadResult.public_id,
                },
            };
        }
        catch (error) {
            this.logger.error(`Media upload failed: ${error.message}`);
            return {
                success: false,
                error: 'Failed to upload media',
            };
        }
    }
    async deleteFile(mediaId, userId) {
        try {
            const media = await this.mediaModel.findById(mediaId);
            if (!media) {
                throw new common_1.NotFoundException('Media not found');
            }
            if (media.userId !== userId) {
                throw new common_1.ForbiddenException('You do not have permission to delete this media');
            }
            if (media.storage === 'cloudinary' && media.cloudinaryPublicId) {
                try {
                    await this.cloudinaryService.deleteImage(media.cloudinaryPublicId);
                }
                catch (error) {
                    this.logger.warn(`Failed to delete file from Cloudinary: ${error.message}`);
                }
            }
            media.isActive = false;
            await media.save();
            return {
                success: true,
                message: 'Media deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Media deletion failed: ${error.message}`);
            return {
                success: false,
                error: error.message || 'Failed to delete media',
            };
        }
    }
    async findById(mediaId) {
        try {
            const media = await this.mediaModel.findById(mediaId);
            if (!media || !media.isActive) {
                throw new common_1.NotFoundException('Media not found');
            }
            return {
                success: true,
                data: media,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to find media',
            };
        }
    }
    async getUserMedia(userId, type, page = 1, limit = 20) {
        try {
            const query = { userId, isActive: true };
            if (type)
                query.type = type;
            const skip = (page - 1) * limit;
            const [media, total] = await Promise.all([
                this.mediaModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.mediaModel.countDocuments(query),
            ]);
            return {
                success: true,
                data: {
                    media,
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
            this.logger.error(`Get user media failed: ${error.message}`);
            return {
                success: false,
                error: 'Failed to fetch user media',
            };
        }
    }
    async deleteUserMedia(userId) {
        try {
            const media = await this.mediaModel.find({ userId, isActive: true });
            for (const item of media) {
                if (item.storage === 'cloudinary' && item.cloudinaryPublicId) {
                    try {
                        await this.cloudinaryService.deleteImage(item.cloudinaryPublicId);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to delete Cloudinary file: ${item.cloudinaryPublicId}`);
                    }
                }
            }
            await this.mediaModel.updateMany({ userId }, { $set: { isActive: false } });
            this.logger.log(`Deleted all media for user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user media: ${error.message}`);
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(media_schema_1.Media.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof cloudinary_service_1.CloudinaryService !== "undefined" && cloudinary_service_1.CloudinaryService) === "function" ? _b : Object])
], MediaService);


/***/ }),

/***/ "./apps/media-service/src/media/schemas/media.schema.ts":
/*!**************************************************************!*\
  !*** ./apps/media-service/src/media/schemas/media.schema.ts ***!
  \**************************************************************/
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
exports.MediaSchema = exports.Media = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let Media = class Media {
};
exports.Media = Media;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Media.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Media.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['image', 'video', 'audio', 'document', 'other'], default: 'other' }),
    __metadata("design:type", String)
], Media.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'local' }),
    __metadata("design:type", String)
], Media.prototype, "storage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Media.prototype, "cloudinaryPublicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Media.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Media.prototype, "isActive", void 0);
exports.Media = Media = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Media);
exports.MediaSchema = mongoose_1.SchemaFactory.createForClass(Media);
exports.MediaSchema.index({ userId: 1, createdAt: -1 });
exports.MediaSchema.index({ type: 1 });
exports.MediaSchema.index({ isActive: 1 });


/***/ }),

/***/ "./generated/media.ts":
/*!****************************!*\
  !*** ./generated/media.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MEDIASERVICE_SERVICE_NAME = exports.MEDIA_PACKAGE_NAME = void 0;
exports.MEDIA_PACKAGE_NAME = 'media';
exports.MEDIASERVICE_SERVICE_NAME = 'MediaService';


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

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "cloudinary":
/*!*****************************!*\
  !*** external "cloudinary" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("cloudinary");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

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
/*!****************************************!*\
  !*** ./apps/media-service/src/main.ts ***!
  \****************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/media-service/src/app.module.ts");
const path_1 = __webpack_require__(/*! path */ "path");
async function bootstrap() {
    const logger = new common_1.Logger('MediaService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('MEDIA_SERVICE_PORT', 50054);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${port}`,
            package: 'media',
            protoPath: (0, path_1.join)(__dirname, '../../../proto/media.proto'),
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
            queue: 'media_queue',
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
    logger.log(`🎨 Media Service (gRPC) is running on port ${port}`);
    logger.log(`� Media Service (RabbitMQ) connected to media_queue`);
}
bootstrap();

})();

/******/ })()
;