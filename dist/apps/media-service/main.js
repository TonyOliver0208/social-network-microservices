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
const media_module_1 = __webpack_require__(7);
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
exports.MediaModule = void 0;
const common_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(6);
const media_controller_1 = __webpack_require__(8);
const media_service_1 = __webpack_require__(9);
const media_schema_1 = __webpack_require__(11);
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: media_schema_1.Media.name, schema: media_schema_1.MediaSchema }]),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService],
        exports: [media_service_1.MediaService],
    })
], MediaModule);


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
var MediaController_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(2);
const media_service_1 = __webpack_require__(9);
const common_2 = __webpack_require__(15);
const media_1 = __webpack_require__(16);
let MediaController = MediaController_1 = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(MediaController_1.name);
    }
    async uploadMedia(payload) {
        this.logger.log(`Upload media request from user: ${payload.userId}`);
        return this.mediaService.uploadFile(payload.userId, payload.file);
    }
    async deleteMedia(payload) {
        this.logger.log(`Delete media request: ${payload.mediaId} by user: ${payload.userId}`);
        return this.mediaService.deleteFile(payload.mediaId, payload.userId);
    }
    async findMediaById(payload) {
        this.logger.log(`Find media by ID: ${payload.mediaId}`);
        return this.mediaService.findById(payload.mediaId);
    }
    async getUserMedia(payload) {
        this.logger.log(`Get media for user: ${payload.userId}`);
        return this.mediaService.getUserMedia(payload.userId, payload.type, payload.page, payload.limit);
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
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], MediaController.prototype, "uploadMedia", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'DeleteMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'GetMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], MediaController.prototype, "findMediaById", null);
__decorate([
    (0, microservices_1.GrpcMethod)(media_1.MEDIASERVICE_SERVICE_NAME, 'GetUserMedia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
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
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MediaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaService = void 0;
const common_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(6);
const mongoose_2 = __webpack_require__(10);
const media_schema_1 = __webpack_require__(11);
const fs = __importStar(__webpack_require__(12));
const path = __importStar(__webpack_require__(13));
const uuid_1 = __webpack_require__(14);
let MediaService = MediaService_1 = class MediaService {
    constructor(mediaModel) {
        this.mediaModel = mediaModel;
        this.logger = new common_1.Logger(MediaService_1.name);
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:3004';
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            this.logger.log(`Upload directory ready: ${this.uploadDir}`);
        }
        catch (error) {
            this.logger.error(`Failed to create upload directory: ${error.message}`);
        }
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
            const ext = path.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            const filePath = path.join(this.uploadDir, filename);
            await fs.writeFile(filePath, file.buffer);
            const media = await this.mediaModel.create({
                userId,
                filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: `${this.baseUrl}/media/${filename}`,
                type: this.getFileType(file.mimetype),
                storage: 'local',
                isActive: true,
            });
            this.logger.log(`Media uploaded successfully: ${media._id}`);
            return {
                success: true,
                data: {
                    id: media._id,
                    url: media.url,
                    type: media.type,
                    filename: media.filename,
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
            try {
                const filePath = path.join(this.uploadDir, media.filename);
                await fs.unlink(filePath);
            }
            catch (error) {
                this.logger.warn(`Failed to delete file from disk: ${error.message}`);
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
                try {
                    const filePath = path.join(this.uploadDir, item.filename);
                    await fs.unlink(filePath);
                }
                catch (error) {
                    this.logger.warn(`Failed to delete file: ${item.filename}`);
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
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], MediaService);


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
exports.MediaSchema = exports.Media = void 0;
const mongoose_1 = __webpack_require__(6);
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
/* 12 */
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("@app/common");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MEDIASERVICE_SERVICE_NAME = exports.MEDIA_PACKAGE_NAME = void 0;
exports.MEDIA_PACKAGE_NAME = 'media';
exports.MEDIASERVICE_SERVICE_NAME = 'MediaService';


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
const path_1 = __webpack_require__(13);
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