/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/auth-service/src/app.module.ts":
/*!*********************************************!*\
  !*** ./apps/auth-service/src/app.module.ts ***!
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
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const auth_controller_1 = __webpack_require__(/*! ./auth/auth.controller */ "./apps/auth-service/src/auth/auth.controller.ts");
const auth_service_1 = __webpack_require__(/*! ./auth/auth.service */ "./apps/auth-service/src/auth/auth.service.ts");
const prisma_service_1 = __webpack_require__(/*! ./prisma/prisma.service */ "./apps/auth-service/src/prisma/prisma.service.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./auth/strategies/jwt.strategy */ "./apps/auth-service/src/auth/strategies/jwt.strategy.ts");
const local_strategy_1 = __webpack_require__(/*! ./auth/strategies/local.strategy */ "./apps/auth-service/src/auth/strategies/local.strategy.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
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
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_SECRET,
                    signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' },
                }),
            }),
            common_2.RedisModule.register(),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, prisma_service_1.PrismaService, jwt_strategy_1.JwtStrategy, local_strategy_1.LocalStrategy],
    })
], AppModule);


/***/ }),

/***/ "./apps/auth-service/src/auth/auth.controller.ts":
/*!*******************************************************!*\
  !*** ./apps/auth-service/src/auth/auth.controller.ts ***!
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
var AuthController_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apps/auth-service/src/auth/auth.service.ts");
const common_2 = __webpack_require__(/*! @app/common */ "@app/common");
const dto_1 = __webpack_require__(/*! ./dto */ "./apps/auth-service/src/auth/dto/index.ts");
const auth_1 = __webpack_require__(/*! @app/proto/auth */ "./generated/auth.ts");
const grpc_js_1 = __webpack_require__(/*! @grpc/grpc-js */ "@grpc/grpc-js");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(registerDto) {
        this.logger.log(`Register request: ${registerDto.email}`);
        const result = await this.authService.register(registerDto);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
            expiresIn: result.data.expiresIn || 900,
            refreshExpiresIn: result.data.refreshExpiresIn || 604800,
        };
    }
    getGrpcStatusCode(error, httpStatusCode) {
        if (error?.includes('already exists') || error?.includes('duplicate')) {
            return grpc_js_1.status.ALREADY_EXISTS;
        }
        if (error?.includes('not found')) {
            return grpc_js_1.status.NOT_FOUND;
        }
        if (error?.includes('Invalid credentials') || error?.includes('Unauthorized')) {
            return grpc_js_1.status.UNAUTHENTICATED;
        }
        if (error?.includes('forbidden') || error?.includes('permission')) {
            return grpc_js_1.status.PERMISSION_DENIED;
        }
        if (error?.includes('invalid') || error?.includes('validation')) {
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
    async login(loginDto) {
        this.logger.log(`Login request: ${loginDto.email}`);
        const result = await this.authService.login(loginDto);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
            expiresIn: result.data.expiresIn || 900,
            refreshExpiresIn: result.data.refreshExpiresIn || 604800,
        };
    }
    async googleAuth(googleAuthDto) {
        this.logger.log(`Google auth request - tokenType: ${googleAuthDto.tokenType}`);
        const result = await this.authService.googleAuth(googleAuthDto);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
            expiresIn: result.data.expiresIn || 900,
            refreshExpiresIn: result.data.refreshExpiresIn || 604800,
        };
    }
    async refreshToken(refreshTokenDto) {
        this.logger.log('Refresh token request');
        const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: null,
        };
    }
    async logout(payload) {
        this.logger.log(`Logout request: ${payload.userId}`);
        const result = await this.authService.logout(payload.userId);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            success: true,
        };
    }
    async validateToken(payload) {
        this.logger.log('Validate token request');
        const result = await this.authService.validateToken(payload.token);
        if (!result.success) {
            const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
            throw new microservices_1.RpcException({
                code: grpcCode,
                message: result.error,
            });
        }
        return {
            valid: true,
            userId: result.data.userId,
            email: result.data.email,
        };
    }
    async handleUserDeleted(data) {
        this.logger.log(`Handling user deleted event: ${data.userId}`);
        await this.authService.logout(data.userId);
    }
    async handlePasswordResetRequest(data) {
        this.logger.log(`Password reset requested for: ${data.email}`);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'Register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof dto_1.RegisterDto !== "undefined" && dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'Login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.LoginDto !== "undefined" && dto_1.LoginDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'GoogleAuth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.GoogleAuthDto !== "undefined" && dto_1.GoogleAuthDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'RefreshToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof dto_1.RefreshTokenDto !== "undefined" && dto_1.RefreshTokenDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'Logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, microservices_1.GrpcMethod)(auth_1.AUTHSERVICE_SERVICE_NAME, 'ValidateToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.USER_DELETED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleUserDeleted", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.EVENTS.PASSWORD_RESET),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handlePasswordResetRequest", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./apps/auth-service/src/auth/auth.service.ts":
/*!****************************************************!*\
  !*** ./apps/auth-service/src/auth/auth.service.ts ***!
  \****************************************************/
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
var AuthService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const google_auth_library_1 = __webpack_require__(/*! google-auth-library */ "google-auth-library");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./apps/auth-service/src/prisma/prisma.service.ts");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
        if (googleClientId) {
            this.googleClient = new google_auth_library_1.OAuth2Client(googleClientId);
            this.logger.log('Google OAuth2 client initialized');
        }
        else {
            this.logger.warn('GOOGLE_CLIENT_ID not configured - Google OAuth will not work');
        }
    }
    async register(registerDto) {
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [{ email: registerDto.email }, { username: registerDto.username }],
                },
            });
            if (existingUser) {
                if (existingUser.email === registerDto.email) {
                    throw new common_1.ConflictException('Email already exists');
                }
                throw new common_1.ConflictException('Username already exists');
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 12);
            const user = await this.prisma.user.create({
                data: {
                    email: registerDto.email,
                    username: registerDto.username,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
            const tokens = await this.generateTokens(user.id, user.email, user.username);
            this.logger.log(`User registered: ${user.email}`);
            return {
                success: true,
                data: {
                    user,
                    ...tokens,
                },
                message: 'User registered successfully',
            };
        }
        catch (error) {
            this.logger.error(`Registration error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async googleAuth(googleAuthDto) {
        try {
            this.logger.log('🔐 [Auth Service] Google OAuth request received');
            this.logger.log(`📋 [Auth Service] Token type: ${googleAuthDto.tokenType}`);
            this.logger.log(`📋 [Auth Service] Token length: ${googleAuthDto.token?.length || 0}`);
            this.logger.log(`📋 [Auth Service] Has Google client: ${!!this.googleClient}`);
            this.logger.log(`📋 [Auth Service] Google client ID configured: ${!!this.configService.get('GOOGLE_CLIENT_ID')}`);
            if (!this.googleClient) {
                this.logger.error('❌ [Auth Service] Google OAuth is not configured');
                throw new common_1.BadRequestException('Google OAuth is not configured');
            }
            let googleUserId;
            let email;
            let name;
            let picture;
            let givenName;
            let familyName;
            if (googleAuthDto.tokenType === 'id_token') {
                this.logger.log('🔍 [Auth Service] Verifying Google ID token...');
                try {
                    const ticket = await this.googleClient.verifyIdToken({
                        idToken: googleAuthDto.token,
                        audience: this.configService.get('GOOGLE_CLIENT_ID'),
                    });
                    const payload = ticket.getPayload();
                    if (!payload) {
                        this.logger.error('❌ [Auth Service] Invalid Google token - no payload');
                        throw new common_1.UnauthorizedException('Invalid Google token');
                    }
                    googleUserId = payload.sub;
                    email = payload.email || '';
                    name = payload.name || email.split('@')[0];
                    picture = payload.picture || '';
                    givenName = payload.given_name || '';
                    familyName = payload.family_name || '';
                    this.logger.log(`✅ [Auth Service] Google ID token verified for user: ${email}`);
                }
                catch (verifyError) {
                    this.logger.error('❌ [Auth Service] Google token verification failed:', verifyError.message);
                    throw new common_1.UnauthorizedException(`Invalid Google token: ${verifyError.message}`);
                }
            }
            else {
                throw new common_1.BadRequestException('Only id_token is currently supported');
            }
            if (!email) {
                throw new common_1.UnauthorizedException('Email not provided by Google');
            }
            let user = await this.prisma.user.findFirst({
                where: {
                    provider: 'google',
                    providerId: googleUserId,
                },
            });
            if (!user) {
                user = await this.prisma.user.findUnique({
                    where: { email },
                });
                if (user) {
                    this.logger.log(`Linking Google account to existing user: ${email}`);
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            provider: 'google',
                            providerId: googleUserId,
                            profileImage: picture || user.profileImage,
                            firstName: givenName || user.firstName,
                            lastName: familyName || user.lastName,
                            isVerified: true,
                            lastLoginAt: new Date(),
                        },
                    });
                }
                else {
                    this.logger.log(`Creating new user from Google account: ${email}`);
                    let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
                    let usernameExists = await this.prisma.user.findUnique({
                        where: { username },
                    });
                    let counter = 1;
                    while (usernameExists) {
                        username = `${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}_${counter}`;
                        usernameExists = await this.prisma.user.findUnique({
                            where: { username },
                        });
                        counter++;
                    }
                    user = await this.prisma.user.create({
                        data: {
                            email,
                            username,
                            provider: 'google',
                            providerId: googleUserId,
                            profileImage: picture,
                            firstName: givenName,
                            lastName: familyName,
                            isVerified: true,
                            isActive: true,
                            lastLoginAt: new Date(),
                        },
                    });
                    this.logger.log(`New Google user created: ${email} (${username})`);
                }
            }
            else {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        profileImage: picture || user.profileImage,
                        firstName: givenName || user.firstName,
                        lastName: familyName || user.lastName,
                        lastLoginAt: new Date(),
                    },
                });
                this.logger.log(`Google user logged in: ${email}`);
            }
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Account is deactivated');
            }
            const tokens = await this.generateTokens(user.id, user.email, user.username);
            const accessExpiration = this.parseExpiration(this.configService.get('JWT_ACCESS_EXPIRATION', '15m'));
            const refreshExpiration = this.parseExpiration(this.configService.get('JWT_REFRESH_EXPIRATION', '7d'));
            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profileImage: user.profileImage,
                        provider: user.provider,
                        isVerified: user.isVerified,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: accessExpiration,
                    refreshExpiresIn: refreshExpiration,
                },
                message: 'Google authentication successful',
            };
        }
        catch (error) {
            this.logger.error('❌ [Auth Service] Google auth error:', error);
            this.logger.error(`❌ [Auth Service] Error message: ${error.message}`);
            this.logger.error(`❌ [Auth Service] Error stack: ${error.stack}`);
            if (error.message?.includes('Token used too late') ||
                error.message?.includes('Invalid token') ||
                error.message?.includes('Token used too early')) {
                this.logger.error('❌ [Auth Service] Google token validation failed');
                return {
                    success: false,
                    error: 'Invalid or expired Google token. Please try signing in again.',
                    statusCode: 401,
                };
            }
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            return {
                success: false,
                error: error.message || 'Google authentication failed',
                statusCode: error.status || 500,
            };
        }
    }
    parseExpiration(expiration) {
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match)
            return 900;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            default: return 900;
        }
    }
    async login(loginDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: loginDto.email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account is deactivated');
            }
            if (!user.password) {
                throw new common_1.UnauthorizedException('Invalid credentials. Please use OAuth login.');
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            const tokens = await this.generateTokens(user.id, user.email, user.username);
            this.logger.log(`User logged in: ${user.email}`);
            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        isVerified: user.isVerified,
                    },
                    ...tokens,
                },
                message: 'Login successful',
            };
        }
        catch (error) {
            this.logger.error(`Login error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async refreshToken(refreshToken) {
        try {
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });
            if (!storedToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (new Date() > storedToken.expiresAt) {
                await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
                throw new common_1.UnauthorizedException('Refresh token expired');
            }
            const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.username);
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            return {
                success: true,
                data: tokens,
                message: 'Token refreshed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Refresh token error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: error.status || 500,
            };
        }
    }
    async logout(userId) {
        try {
            await this.prisma.refreshToken.deleteMany({
                where: { userId },
            });
            return {
                success: true,
                message: 'Logged out successfully',
            };
        }
        catch (error) {
            this.logger.error(`Logout error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                statusCode: 500,
            };
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    isActive: true,
                    isVerified: true,
                },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return {
                success: true,
                data: {
                    userId: user.id,
                    email: user.email,
                    username: user.username,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Invalid token',
                statusCode: 401,
            };
        }
    }
    async generateTokens(userId, email, username) {
        const jwtPayload = {
            sub: userId,
            email,
            username,
            type: 'access',
        };
        const accessToken = this.jwtService.sign(jwtPayload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        });
        const refreshPayload = {
            ...jwtPayload,
            type: 'refresh',
        };
        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], AuthService);


/***/ }),

/***/ "./apps/auth-service/src/auth/dto/index.ts":
/*!*************************************************!*\
  !*** ./apps/auth-service/src/auth/dto/index.ts ***!
  \*************************************************/
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
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers and underscores',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class GoogleAuthDto {
}
exports.GoogleAuthDto = GoogleAuthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "tokenType", void 0);


/***/ }),

/***/ "./apps/auth-service/src/auth/strategies/jwt.strategy.ts":
/*!***************************************************************!*\
  !*** ./apps/auth-service/src/auth/strategies/jwt.strategy.ts ***!
  \***************************************************************/
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./apps/auth-service/src/prisma/prisma.service.ts");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                isVerified: true,
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        return {
            userId: user.id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),

/***/ "./apps/auth-service/src/auth/strategies/local.strategy.ts":
/*!*****************************************************************!*\
  !*** ./apps/auth-service/src/auth/strategies/local.strategy.ts ***!
  \*****************************************************************/
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_local_1 = __webpack_require__(/*! passport-local */ "passport-local");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./apps/auth-service/src/prisma/prisma.service.ts");
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy) {
    constructor(prisma) {
        super({
            usernameField: 'email',
        });
        this.prisma = prisma;
    }
    async validate(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials. Please use OAuth login.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        return {
            userId: user.id,
            email: user.email,
            username: user.username,
        };
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], LocalStrategy);


/***/ }),

/***/ "./apps/auth-service/src/prisma/prisma.service.ts":
/*!********************************************************!*\
  !*** ./apps/auth-service/src/prisma/prisma.service.ts ***!
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
const client_auth_1 = __webpack_require__(/*! .prisma/client-auth */ ".prisma/client-auth");
let PrismaService = class PrismaService extends client_auth_1.PrismaClient {
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

/***/ ".prisma/client-auth":
/*!**************************************!*\
  !*** external ".prisma/client-auth" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require(".prisma/client-auth");

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

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "google-auth-library":
/*!**************************************!*\
  !*** external "google-auth-library" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require("google-auth-library");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "passport-local":
/*!*********************************!*\
  !*** external "passport-local" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("passport-local");

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
  !*** ./apps/auth-service/src/main.ts ***!
  \***************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/auth-service/src/app.module.ts");
const path_1 = __webpack_require__(/*! path */ "path");
async function bootstrap() {
    const logger = new common_1.Logger('AuthService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('AUTH_SERVICE_PORT', 50051);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${port}`,
            package: 'auth',
            protoPath: (0, path_1.join)(__dirname, '..', '..', '..', 'proto', 'auth.proto'),
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
            queue: 'auth_queue',
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
    logger.log(`🔐 Auth Service (gRPC) is running on port ${port}`);
    logger.log(`📨 Auth Service (RabbitMQ) connected to auth_queue`);
}
bootstrap();

})();

/******/ })()
;