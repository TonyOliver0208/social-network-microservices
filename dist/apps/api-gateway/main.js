/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/api-gateway/src/app.module.ts":
/*!********************************************!*\
  !*** ./apps/api-gateway/src/app.module.ts ***!
  \********************************************/
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
const throttler_1 = __webpack_require__(/*! @nestjs/throttler */ "@nestjs/throttler");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const auth_module_1 = __webpack_require__(/*! ./auth/auth.module */ "./apps/api-gateway/src/auth/auth.module.ts");
const user_module_1 = __webpack_require__(/*! ./user/user.module */ "./apps/api-gateway/src/user/user.module.ts");
const post_module_1 = __webpack_require__(/*! ./post/post.module */ "./apps/api-gateway/src/post/post.module.ts");
const media_module_1 = __webpack_require__(/*! ./media/media.module */ "./apps/api-gateway/src/media/media.module.ts");
const search_module_1 = __webpack_require__(/*! ./search/search.module */ "./apps/api-gateway/src/search/search.module.ts");
const health_controller_1 = __webpack_require__(/*! ./health/health.controller */ "./apps/api-gateway/src/health/health.controller.ts");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(common_2.JwtMiddleware)
            .exclude('/api/v1/auth/(.*)', '/api/v1/health', '/api/v1/health/(.*)', '/api/docs', '/api/docs/(.*)')
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            common_2.RedisModule.register(),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            post_module_1.PostModule,
            media_module_1.MediaModule,
            search_module_1.SearchModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);


/***/ }),

/***/ "./apps/api-gateway/src/auth/auth.controller.ts":
/*!******************************************************!*\
  !*** ./apps/api-gateway/src/auth/auth.controller.ts ***!
  \******************************************************/
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const dto_1 = __webpack_require__(/*! ./dto */ "./apps/api-gateway/src/auth/dto/index.ts");
const auth_1 = __webpack_require__(/*! @app/proto/auth */ "./generated/auth.ts");
let AuthController = class AuthController {
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.authService = this.client.getService(auth_1.AUTHSERVICE_SERVICE_NAME);
    }
    async register(registerDto) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.authService.Register(registerDto));
        }
        catch (error) {
            const message = error.details || error.message || 'Registration failed';
            const statusCode = this.getHttpStatusFromGrpcError(error);
            throw new common_1.HttpException(message, statusCode);
        }
    }
    getHttpStatusFromGrpcError(error) {
        const grpcCode = error.code;
        switch (grpcCode) {
            case 6:
                return common_1.HttpStatus.CONFLICT;
            case 3:
                return common_1.HttpStatus.BAD_REQUEST;
            case 16:
                return common_1.HttpStatus.UNAUTHORIZED;
            case 7:
                return common_1.HttpStatus.FORBIDDEN;
            case 5:
                return common_1.HttpStatus.NOT_FOUND;
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async login(loginDto) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.authService.Login(loginDto));
        }
        catch (error) {
            const message = error.details || error.message || 'Login failed';
            const statusCode = this.getHttpStatusFromGrpcError(error);
            throw new common_1.HttpException(message, statusCode);
        }
    }
    async googleAuth(googleAuthDto) {
        try {
            console.log('🔐 [API Gateway] Google OAuth request received:', {
                hasToken: !!googleAuthDto.token,
                tokenType: googleAuthDto.tokenType,
                tokenLength: googleAuthDto.token?.length || 0
            });
            const result = await (0, rxjs_1.lastValueFrom)(this.authService.GoogleAuth(googleAuthDto));
            console.log('✅ [API Gateway] Google OAuth successful:', {
                hasAccessToken: !!result.accessToken,
                hasRefreshToken: !!result.refreshToken,
                hasUser: !!result.user
            });
            return {
                success: true,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresIn: result.expiresIn,
                    refreshExpiresIn: result.refreshExpiresIn,
                    user: result.user,
                },
                message: 'Google authentication successful',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ [API Gateway] Google OAuth error:', {
                errorCode: error.code,
                errorDetails: error.details,
                errorMessage: error.message,
                fullError: error
            });
            const message = error.details || error.message || 'Google authentication failed';
            const statusCode = this.getHttpStatusFromGrpcError(error);
            throw new common_1.HttpException({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            }, statusCode);
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            console.log('🔄 [API Gateway] Refresh token request received');
            console.log('🔍 [API Gateway] Request body:', {
                hasRefreshToken: !!refreshTokenDto.refreshToken,
                tokenLength: refreshTokenDto.refreshToken?.length || 0,
                tokenPreview: refreshTokenDto.refreshToken?.substring(0, 50)
            });
            const result = await (0, rxjs_1.lastValueFrom)(this.authService.RefreshToken(refreshTokenDto));
            console.log('✅ [API Gateway] Token refresh successful');
            console.log('🔍 [API Gateway] Result structure:', {
                hasAccessToken: !!result.accessToken,
                hasRefreshToken: !!result.refreshToken,
                hasExpiresIn: result.expiresIn !== undefined,
                hasRefreshExpiresIn: result.refreshExpiresIn !== undefined,
                expiresIn: result.expiresIn,
                refreshExpiresIn: result.refreshExpiresIn,
                newRefreshTokenPreview: result.refreshToken?.substring(0, 50)
            });
            return {
                success: true,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresIn: result.expiresIn,
                    refreshExpiresIn: result.refreshExpiresIn,
                },
                message: 'Token refreshed successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ [API Gateway] Refresh token error:', {
                errorCode: error.code,
                errorDetails: error.details,
                errorMessage: error.message
            });
            const message = error.details || error.message || 'Token refresh failed';
            const statusCode = this.getHttpStatusFromGrpcError(error);
            throw new common_1.HttpException(message, statusCode);
        }
    }
    async logout(user) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.authService.Logout({ userId: user.userId }));
        }
        catch (error) {
            const message = error.details || error.message || 'Logout failed';
            const statusCode = this.getHttpStatusFromGrpcError(error);
            throw new common_1.HttpException(message, statusCode);
        }
    }
    async getCurrentUser(user) {
        return {
            success: true,
            data: user,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof dto_1.RegisterDto !== "undefined" && dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.LoginDto !== "undefined" && dto_1.LoginDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, swagger_1.ApiOperation)({
        summary: 'Authenticate with Google OAuth',
        description: 'Validates Google OAuth token and returns internal JWT tokens for the application'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.GoogleAuthDto !== "undefined" && dto_1.GoogleAuthDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof dto_1.RefreshTokenDto !== "undefined" && dto_1.RefreshTokenDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    __param(0, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user' }),
    __param(0, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.AUTH_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./apps/api-gateway/src/auth/auth.module.ts":
/*!**************************************************!*\
  !*** ./apps/api-gateway/src/auth/auth.module.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./apps/api-gateway/src/auth/auth.controller.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const auth_1 = __webpack_require__(/*! @app/proto/auth */ "./generated/auth.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_2.GrpcModule.register({
                name: common_2.SERVICES.AUTH_SERVICE,
                package: auth_1.AUTH_PACKAGE_NAME,
                protoFileName: 'auth.proto',
                urlConfigKey: 'AUTH_SERVICE_URL',
                defaultUrl: 'localhost:50051',
            }),
        ],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);


/***/ }),

/***/ "./apps/api-gateway/src/auth/dto/index.ts":
/*!************************************************!*\
  !*** ./apps/api-gateway/src/auth/dto/index.ts ***!
  \************************************************/
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
exports.GoogleAuthDto = exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'johndoe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class GoogleAuthDto {
}
exports.GoogleAuthDto = GoogleAuthDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
        description: 'Google OAuth token (id_token or access_token)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'id_token',
        description: 'Type of token: id_token or access_token',
        enum: ['id_token', 'access_token']
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "tokenType", void 0);


/***/ }),

/***/ "./apps/api-gateway/src/health/health.controller.ts":
/*!**********************************************************!*\
  !*** ./apps/api-gateway/src/health/health.controller.ts ***!
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let HealthController = class HealthController {
    check() {
        return {
            success: true,
            message: 'API Gateway is healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    ping() {
        return {
            success: true,
            message: 'pong',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "ping", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health')
], HealthController);


/***/ }),

/***/ "./apps/api-gateway/src/main.ts":
/*!**************************************!*\
  !*** ./apps/api-gateway/src/main.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/api-gateway/src/app.module.ts");
const compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));
const helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
async function bootstrap() {
    const logger = new common_1.Logger('API Gateway');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('API_GATEWAY_PORT', 3000);
    const corsOrigins = configService.get('CORS_ORIGIN', '*').split(',');
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-User-ID',
            'X-Request-Time',
            'x-source',
            'X-Source'
        ],
        exposedHeaders: ['X-Request-ID'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new common_2.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('DevColl API')
        .setDescription('DevColl Social Network API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management endpoints')
        .addTag('posts', 'Post management endpoints')
        .addTag('media', 'Media upload endpoints')
        .addTag('search', 'Search endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 API Gateway is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();


/***/ }),

/***/ "./apps/api-gateway/src/media/media.controller.ts":
/*!********************************************************!*\
  !*** ./apps/api-gateway/src/media/media.controller.ts ***!
  \********************************************************/
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
exports.MediaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const media_1 = __webpack_require__(/*! @app/proto/media */ "./generated/media.ts");
let MediaController = class MediaController {
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.mediaService = this.client.getService(media_1.MEDIASERVICE_SERVICE_NAME);
    }
    async uploadMedia(userId, file) {
        if (!file) {
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await (0, rxjs_1.lastValueFrom)(this.mediaService.UploadMedia({
                userId,
                file: new Uint8Array(file.buffer),
                filename: file.originalname,
                mimetype: file.mimetype,
                type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to upload media', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMedia(mediaId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.mediaService.DeleteMedia({
                id: mediaId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete media', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media file' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('media'),
    (0, common_1.Controller)('media'),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.MEDIA_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], MediaController);


/***/ }),

/***/ "./apps/api-gateway/src/media/media.module.ts":
/*!****************************************************!*\
  !*** ./apps/api-gateway/src/media/media.module.ts ***!
  \****************************************************/
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
const media_controller_1 = __webpack_require__(/*! ./media.controller */ "./apps/api-gateway/src/media/media.controller.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const media_1 = __webpack_require__(/*! @app/proto/media */ "./generated/media.ts");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_2.GrpcModule.register({
                name: common_2.SERVICES.MEDIA_SERVICE,
                package: media_1.MEDIA_PACKAGE_NAME,
                protoFileName: 'media.proto',
                urlConfigKey: 'MEDIA_SERVICE_URL',
                defaultUrl: 'localhost:50054',
            }),
        ],
        controllers: [media_controller_1.MediaController],
    })
], MediaModule);


/***/ }),

/***/ "./apps/api-gateway/src/post/dto/index.ts":
/*!************************************************!*\
  !*** ./apps/api-gateway/src/post/dto/index.ts ***!
  \************************************************/
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
exports.CreateCommentDto = exports.UpdatePostDto = exports.CreatePostDto = exports.Privacy = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
var Privacy;
(function (Privacy) {
    Privacy["PUBLIC"] = "PUBLIC";
    Privacy["FRIENDS"] = "FRIENDS";
    Privacy["PRIVATE"] = "PRIVATE";
})(Privacy || (exports.Privacy = Privacy = {}));
class CreatePostDto {
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'This is my first post!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: ['https://example.com/image1.jpg'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: Privacy.PUBLIC, enum: Privacy }),
    (0, class_validator_1.IsEnum)(Privacy),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "privacy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: ['javascript', 'react', 'nextjs'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "tags", void 0);
class UpdatePostDto {
}
exports.UpdatePostDto = UpdatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Updated content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: ['https://example.com/image1.jpg'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdatePostDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: Privacy.PUBLIC, enum: Privacy }),
    (0, class_validator_1.IsEnum)(Privacy),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "privacy", void 0);
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Great post!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'parent-comment-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parentId", void 0);


/***/ }),

/***/ "./apps/api-gateway/src/post/post.controller.ts":
/*!******************************************************!*\
  !*** ./apps/api-gateway/src/post/post.controller.ts ***!
  \******************************************************/
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PostController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const dto_1 = __webpack_require__(/*! ./dto */ "./apps/api-gateway/src/post/dto/index.ts");
const post_1 = __webpack_require__(/*! @app/proto/post */ "./generated/post.ts");
let PostController = class PostController {
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.postService = this.client.getService(post_1.POSTSERVICE_SERVICE_NAME);
    }
    async createPost(userId, createPostDto) {
        try {
            console.log('[API Gateway] Create post request received:', {
                userId,
                hasContent: !!createPostDto.content,
                contentLength: createPostDto.content?.length,
                mediaUrls: createPostDto.mediaUrls,
                privacy: createPostDto.privacy,
                tags: createPostDto.tags,
                fullDto: createPostDto,
            });
            const result = await (0, rxjs_1.lastValueFrom)(this.postService.CreatePost({
                userId,
                content: createPostDto.content,
                mediaUrls: createPostDto.mediaUrls || [],
                visibility: createPostDto.privacy || 'PUBLIC',
                tags: createPostDto.tags || [],
            }));
            console.log('[API Gateway] Post created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('[API Gateway] Create post error:', error);
            throw new common_1.HttpException(error.message || 'Failed to create post', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getFeed(page, limit) {
        try {
            const result = await (0, rxjs_1.lastValueFrom)(this.postService.GetFeed({
                userId: '',
                page: page || 1,
                limit: limit || 20,
            }));
            console.log('[API Gateway] Feed response:', JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            console.error('[API Gateway] Feed error:', error);
            throw new common_1.HttpException(error.message || 'Failed to get feed', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserPosts(targetUserId, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetUserPosts({
                userId: targetUserId,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get user posts', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPopularTags(limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetPopularTags({
                limit: limit || 5,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get popular tags', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPostsByTag(tagName, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetPostsByTag({
                tagName,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get posts by tag', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTags(page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetTags({
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get tags', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserFavorites(userId, listName, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetUserFavorites({
                userId,
                listName,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get favorites', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPost(postId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetPostById({
                id: postId,
                userId: userId || undefined,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Post not found', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async updatePost(postId, userId, updatePostDto) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.UpdatePost({
                id: postId,
                userId,
                ...updatePostDto,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update post', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deletePost(postId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.DeletePost({
                id: postId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete post', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async likePost(postId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.LikePost({
                postId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to like post', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async unlikePost(postId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.UnlikePost({
                postId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to unlike post', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createComment(postId, userId, createCommentDto) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.CreateComment({
                postId,
                userId,
                content: createCommentDto.content,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create comment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getPostComments(postId, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetComments({
                postId,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get comments', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteComment(commentId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.DeleteComment({
                id: commentId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete comment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async voteQuestion(questionId, userId, body) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.VoteQuestion({
                questionId,
                userId,
                voteType: body.voteType,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to vote on question', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getQuestionVotes(questionId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetQuestionVotes({
                questionId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get question votes', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async favoriteQuestion(questionId, userId, body) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.FavoriteQuestion({
                questionId,
                userId,
                listName: body?.listName,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to favorite question', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async unfavoriteQuestion(questionId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.UnfavoriteQuestion({
                questionId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to unfavorite question', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createAnswer(questionId, userId, body) {
        try {
            console.log('[API Gateway] Creating answer:', { questionId, userId, contentLength: body.content?.length });
            const result = await (0, rxjs_1.lastValueFrom)(this.postService.CreateAnswer({
                questionId,
                userId,
                content: body.content,
            }));
            console.log('[API Gateway] Answer created successfully');
            return result;
        }
        catch (error) {
            console.error('[API Gateway] Failed to create answer:', error);
            throw new common_1.HttpException(error.message || 'Failed to create answer', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getQuestionAnswers(questionId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetQuestionAnswers({
                questionId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get answers', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateAnswer(answerId, userId, body) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.UpdateAnswer({
                answerId,
                userId,
                content: body.content,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update answer', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteAnswer(answerId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.DeleteAnswer({
                answerId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete answer', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async voteAnswer(answerId, userId, body) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.VoteAnswer({
                answerId,
                userId,
                voteType: body.voteType,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to vote on answer', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async acceptAnswer(answerId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.AcceptAnswer({
                answerId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to accept answer', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAnswerVotes(answerId, userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.postService.GetAnswerVotes({
                answerId,
                userId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get answer votes', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new post' }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof dto_1.CreatePostDto !== "undefined" && dto_1.CreatePostDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public feed (no authentication required)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user posts' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserPosts", null);
__decorate([
    (0, common_1.Get)('tags/popular'),
    (0, swagger_1.ApiOperation)({ summary: 'Get popular tags' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPopularTags", null);
__decorate([
    (0, common_1.Get)('tags/:tagName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get posts by tag' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('tagName')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostsByTag", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tags' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)('favorites'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user favorite questions' }),
    (0, swagger_1.ApiQuery)({ name: 'listName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('listName')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserFavorites", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get post by ID (no authentication required, but userId for favorite status)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPost", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_c = typeof dto_1.UpdatePostDto !== "undefined" && dto_1.UpdatePostDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Like a post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "likePost", null);
__decorate([
    (0, common_1.Delete)(':id/like'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unlike a post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "unlikePost", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Comment on a post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_d = typeof dto_1.CreateCommentDto !== "undefined" && dto_1.CreateCommentDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get post comments (no authentication required)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostComments", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete comment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vote on a question (up/down) - toggles if same vote' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "voteQuestion", null);
__decorate([
    (0, common_1.Get)(':id/votes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vote counts for a question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getQuestionVotes", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle favorite on a question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "favoriteQuestion", null);
__decorate([
    (0, common_1.Delete)(':id/favorite'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove favorite from a question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "unfavoriteQuestion", null);
__decorate([
    (0, common_1.Post)(':id/answers'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an answer to a question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createAnswer", null);
__decorate([
    (0, common_1.Get)(':id/answers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all answers for a question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getQuestionAnswers", null);
__decorate([
    (0, common_1.Patch)('answers/:answerId'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update an answer' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updateAnswer", null);
__decorate([
    (0, common_1.Delete)('answers/:answerId'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an answer' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deleteAnswer", null);
__decorate([
    (0, common_1.Post)('answers/:answerId/vote'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vote on an answer (up/down)' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "voteAnswer", null);
__decorate([
    (0, common_1.Post)('answers/:answerId/accept'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an answer (question author only)' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "acceptAnswer", null);
__decorate([
    (0, common_1.Get)('answers/:answerId/votes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vote counts for an answer' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_2.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getAnswerVotes", null);
exports.PostController = PostController = __decorate([
    (0, swagger_1.ApiTags)('posts'),
    (0, common_1.Controller)('posts'),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.POST_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], PostController);


/***/ }),

/***/ "./apps/api-gateway/src/post/post.module.ts":
/*!**************************************************!*\
  !*** ./apps/api-gateway/src/post/post.module.ts ***!
  \**************************************************/
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
const post_controller_1 = __webpack_require__(/*! ./post.controller */ "./apps/api-gateway/src/post/post.controller.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const post_1 = __webpack_require__(/*! @app/proto/post */ "./generated/post.ts");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_2.GrpcModule.register({
                name: common_2.SERVICES.POST_SERVICE,
                package: post_1.POST_PACKAGE_NAME,
                protoFileName: 'post.proto',
                urlConfigKey: 'POST_SERVICE_URL',
                defaultUrl: 'localhost:50053',
            }),
        ],
        controllers: [post_controller_1.PostController],
    })
], PostModule);


/***/ }),

/***/ "./apps/api-gateway/src/search/search.controller.ts":
/*!**********************************************************!*\
  !*** ./apps/api-gateway/src/search/search.controller.ts ***!
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const search_1 = __webpack_require__(/*! @app/proto/search */ "./generated/search.ts");
let SearchController = class SearchController {
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.searchService = this.client.getService(search_1.SEARCHSERVICE_SERVICE_NAME);
    }
    async searchPosts(query, page, limit) {
        if (!query || query.trim().length === 0) {
            throw new common_1.HttpException('Search query is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await (0, rxjs_1.lastValueFrom)(this.searchService.SearchPosts({
                query,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Search failed', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchUsers(query, page, limit) {
        if (!query || query.trim().length === 0) {
            throw new common_1.HttpException('Search query is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await (0, rxjs_1.lastValueFrom)(this.searchService.SearchUsers({
                query,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Search failed', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('posts'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search posts' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchPosts", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search users' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchUsers", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('search'),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.SEARCH_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], SearchController);


/***/ }),

/***/ "./apps/api-gateway/src/search/search.module.ts":
/*!******************************************************!*\
  !*** ./apps/api-gateway/src/search/search.module.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const search_controller_1 = __webpack_require__(/*! ./search.controller */ "./apps/api-gateway/src/search/search.controller.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const search_1 = __webpack_require__(/*! @app/proto/search */ "./generated/search.ts");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_2.GrpcModule.register({
                name: common_2.SERVICES.SEARCH_SERVICE,
                package: search_1.SEARCH_PACKAGE_NAME,
                protoFileName: 'search.proto',
                urlConfigKey: 'SEARCH_SERVICE_URL',
                defaultUrl: 'localhost:50055',
            }),
        ],
        controllers: [search_controller_1.SearchController],
    })
], SearchModule);


/***/ }),

/***/ "./apps/api-gateway/src/user/dto/index.ts":
/*!************************************************!*\
  !*** ./apps/api-gateway/src/user/dto/index.ts ***!
  \************************************************/
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
exports.UpdateProfileDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Software Developer & Tech Enthusiast' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'https://example.com/cover.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'https://johndoe.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'San Francisco, CA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1990-01-01' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateProfileDto.prototype, "isPrivate", void 0);


/***/ }),

/***/ "./apps/api-gateway/src/user/user.controller.ts":
/*!******************************************************!*\
  !*** ./apps/api-gateway/src/user/user.controller.ts ***!
  \******************************************************/
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const dto_1 = __webpack_require__(/*! ./dto */ "./apps/api-gateway/src/user/dto/index.ts");
const user_1 = __webpack_require__(/*! @app/proto/user */ "./generated/user.ts");
let UserController = class UserController {
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.userService = this.client.getService(user_1.USERSERVICE_SERVICE_NAME);
    }
    async getProfile(userId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.GetUserById({ id: userId }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get profile', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateProfile(userId, updateProfileDto) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.UpdateProfile({
                id: userId,
                ...updateProfileDto,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update profile', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async followUser(followerId, followingId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.FollowUser({
                followerId,
                followingId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to follow user', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async unfollowUser(followerId, followingId) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.UnfollowUser({
                followerId,
                followingId,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to unfollow user', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getFollowers(userId, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.GetFollowers({
                userId,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get followers', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFollowing(userId, page, limit) {
        try {
            return await (0, rxjs_1.lastValueFrom)(this.userService.GetFollowing({
                userId,
                page: page || 1,
                limit: limit || 20,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get following', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof dto_1.UpdateProfileDto !== "undefined" && dto_1.UpdateProfileDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Follow a user' }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)(':id/follow'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unfollow a user' }),
    __param(0, (0, common_2.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)(':id/followers'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user followers' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)(':id/following'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get users followed by this user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFollowing", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)(common_2.SERVICES.USER_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientGrpc !== "undefined" && microservices_1.ClientGrpc) === "function" ? _a : Object])
], UserController);


/***/ }),

/***/ "./apps/api-gateway/src/user/user.module.ts":
/*!**************************************************!*\
  !*** ./apps/api-gateway/src/user/user.module.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const user_controller_1 = __webpack_require__(/*! ./user.controller */ "./apps/api-gateway/src/user/user.controller.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const user_1 = __webpack_require__(/*! @app/proto/user */ "./generated/user.ts");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_2.GrpcModule.register({
                name: common_2.SERVICES.USER_SERVICE,
                package: user_1.USER_PACKAGE_NAME,
                protoFileName: 'user.proto',
                urlConfigKey: 'USER_SERVICE_URL',
                defaultUrl: 'localhost:50052',
            }),
        ],
        controllers: [user_controller_1.UserController],
    })
], UserModule);


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

/***/ "./generated/search.ts":
/*!*****************************!*\
  !*** ./generated/search.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SEARCHSERVICE_SERVICE_NAME = exports.SEARCH_PACKAGE_NAME = void 0;
exports.SEARCH_PACKAGE_NAME = 'search';
exports.SEARCHSERVICE_SERVICE_NAME = 'SearchService';


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

/***/ "@app/common":
/*!******************************!*\
  !*** external "@app/common" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@app/common");

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

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/throttler":
/*!************************************!*\
  !*** external "@nestjs/throttler" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("compression");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("helmet");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./apps/api-gateway/src/main.ts");
/******/ 	
/******/ })()
;