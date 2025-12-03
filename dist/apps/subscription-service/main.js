/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/subscription-service/src/app.module.ts":
/*!*****************************************************!*\
  !*** ./apps/subscription-service/src/app.module.ts ***!
  \*****************************************************/
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
const prisma_module_1 = __webpack_require__(/*! ./prisma/prisma.module */ "./apps/subscription-service/src/prisma/prisma.module.ts");
const subscription_module_1 = __webpack_require__(/*! ./subscription/subscription.module */ "./apps/subscription-service/src/subscription/subscription.module.ts");
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
            prisma_module_1.PrismaModule,
            subscription_module_1.SubscriptionModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/subscription-service/src/prisma/prisma.module.ts":
/*!***************************************************************!*\
  !*** ./apps/subscription-service/src/prisma/prisma.module.ts ***!
  \***************************************************************/
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
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./apps/subscription-service/src/prisma/prisma.service.ts");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),

/***/ "./apps/subscription-service/src/prisma/prisma.service.ts":
/*!****************************************************************!*\
  !*** ./apps/subscription-service/src/prisma/prisma.service.ts ***!
  \****************************************************************/
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
const client_subscription_1 = __webpack_require__(/*! .prisma/client-subscription */ ".prisma/client-subscription");
let PrismaService = class PrismaService extends client_subscription_1.PrismaClient {
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

/***/ "./apps/subscription-service/src/subscription/subscription.controller.ts":
/*!*******************************************************************************!*\
  !*** ./apps/subscription-service/src/subscription/subscription.controller.ts ***!
  \*******************************************************************************/
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
exports.SubscriptionController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const subscription_service_1 = __webpack_require__(/*! ./subscription.service */ "./apps/subscription-service/src/subscription/subscription.service.ts");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getSubscription(userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log('[Subscription Controller] 🔍 Fetching subscription for user:', userId);
            const subscription = await this.subscriptionService.getSubscription(userId);
            console.log('[Subscription Controller] ✅ Subscription found:', {
                isPremium: subscription?.isPremium,
                premiumSince: subscription?.premiumSince,
            });
            return {
                success: true,
                data: subscription
                    ? {
                        id: subscription.id,
                        userId: subscription.userId,
                        isPremium: subscription.isPremium,
                        tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
                        status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
                        premiumSince: subscription.premiumSince?.toISOString(),
                        startDate: subscription.premiumSince?.toISOString(),
                        endDate: subscription.expiresAt?.toISOString(),
                        createdAt: subscription.createdAt.toISOString(),
                        updatedAt: subscription.updatedAt.toISOString(),
                    }
                    : null,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch subscription', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async upgradeToPremium(body) {
        try {
            if (!body.userId || !body.paymentId) {
                throw new common_1.HttpException('User ID and Payment ID are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const subscription = await this.subscriptionService.upgradeToPremium(body.userId, body.paymentId);
            return {
                success: true,
                data: {
                    id: subscription.id,
                    userId: subscription.userId,
                    tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
                    status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
                    startDate: subscription.premiumSince?.toISOString(),
                    endDate: subscription.expiresAt?.toISOString(),
                    createdAt: subscription.createdAt.toISOString(),
                    updatedAt: subscription.updatedAt.toISOString(),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to upgrade subscription', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelPremium(body) {
        try {
            if (!body.userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const subscription = await this.subscriptionService.cancelPremium(body.userId);
            return {
                success: true,
                data: {
                    id: subscription.id,
                    userId: subscription.userId,
                    tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
                    status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
                    startDate: subscription.premiumSince?.toISOString(),
                    endDate: subscription.expiresAt?.toISOString(),
                    createdAt: subscription.createdAt.toISOString(),
                    updatedAt: subscription.updatedAt.toISOString(),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to cancel subscription', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPayment(body) {
        try {
            if (!body.userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!body.amount) {
                throw new common_1.HttpException('Amount is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!body.method) {
                throw new common_1.HttpException('Payment method is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const payment = await this.subscriptionService.createPayment(body.userId, {
                amount: body.amount,
                currency: body.currency,
                paymentMethod: body.method,
            });
            return {
                success: true,
                data: {
                    id: payment.id,
                    userId: payment.userId,
                    amount: Number(payment.amount),
                    currency: payment.currency,
                    method: payment.paymentMethod,
                    status: payment.status,
                    transactionId: payment.transactionId ?? undefined,
                    createdAt: payment.createdAt.toISOString(),
                    updatedAt: payment.updatedAt.toISOString(),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create payment', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentHistory(userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const payments = await this.subscriptionService.getPaymentHistory(userId);
            return {
                success: true,
                data: payments.map((payment) => ({
                    id: payment.id,
                    userId: payment.userId,
                    amount: Number(payment.amount),
                    currency: payment.currency,
                    method: payment.paymentMethod,
                    status: payment.status,
                    transactionId: payment.transactionId ?? undefined,
                    createdAt: payment.createdAt.toISOString(),
                    updatedAt: payment.updatedAt.toISOString(),
                })),
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch payment history', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePaymentStatus(paymentId, body) {
        try {
            if (!paymentId) {
                throw new common_1.HttpException('Payment ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const payment = await this.subscriptionService.updatePaymentStatus(paymentId, body.status, body.transactionId);
            return {
                success: true,
                data: {
                    id: payment.id,
                    userId: payment.userId,
                    amount: Number(payment.amount),
                    currency: payment.currency,
                    method: payment.paymentMethod,
                    status: payment.status,
                    transactionId: payment.transactionId ?? undefined,
                    createdAt: payment.createdAt.toISOString(),
                    updatedAt: payment.updatedAt.toISOString(),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update payment status', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPayPalOrder(userId) {
        try {
            console.log('[Subscription Controller] Received create-order request, userId:', userId);
            if (!userId) {
                console.error('[Subscription Controller] User ID is missing!');
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log('[Subscription Controller] Calling service to create PayPal order...');
            const result = await this.subscriptionService.createPayPalOrder(userId);
            console.log('[Subscription Controller] PayPal order created successfully, returning response...');
            const response = {
                success: true,
                data: result,
            };
            console.log('[Subscription Controller] Response:', JSON.stringify(response));
            return response;
        }
        catch (error) {
            console.error('[Subscription Controller] Error creating PayPal order:', {
                message: error.message,
                stack: error.stack,
                status: error.status,
            });
            throw new common_1.HttpException(error.message || 'Failed to create PayPal order', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async capturePayPalOrder(body, userId) {
        try {
            if (!body.orderId) {
                throw new common_1.HttpException('Order ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.subscriptionService.capturePayPalOrder(body.orderId, userId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to capture PayPal order', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "upgradeToPremium", null);
__decorate([
    (0, common_1.Post)('cancel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelPremium", null);
__decorate([
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Put)('payments/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Post)('create-order'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createPayPalOrder", null);
__decorate([
    (0, common_1.Post)('capture-order'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "capturePayPalOrder", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [typeof (_a = typeof subscription_service_1.SubscriptionService !== "undefined" && subscription_service_1.SubscriptionService) === "function" ? _a : Object])
], SubscriptionController);


/***/ }),

/***/ "./apps/subscription-service/src/subscription/subscription.module.ts":
/*!***************************************************************************!*\
  !*** ./apps/subscription-service/src/subscription/subscription.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const subscription_controller_1 = __webpack_require__(/*! ./subscription.controller */ "./apps/subscription-service/src/subscription/subscription.controller.ts");
const subscription_service_1 = __webpack_require__(/*! ./subscription.service */ "./apps/subscription-service/src/subscription/subscription.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./apps/subscription-service/src/prisma/prisma.module.ts");
let SubscriptionModule = class SubscriptionModule {
};
exports.SubscriptionModule = SubscriptionModule;
exports.SubscriptionModule = SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [subscription_controller_1.SubscriptionController],
        providers: [subscription_service_1.SubscriptionService],
        exports: [subscription_service_1.SubscriptionService],
    })
], SubscriptionModule);


/***/ }),

/***/ "./apps/subscription-service/src/subscription/subscription.service.ts":
/*!****************************************************************************!*\
  !*** ./apps/subscription-service/src/subscription/subscription.service.ts ***!
  \****************************************************************************/
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./apps/subscription-service/src/prisma/prisma.service.ts");
const paypal = __importStar(__webpack_require__(/*! @paypal/checkout-server-sdk */ "@paypal/checkout-server-sdk"));
let SubscriptionService = class SubscriptionService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        const mode = this.configService.get('PAYPAL_MODE', 'sandbox');
        const environment = mode === 'production'
            ? new paypal.core.LiveEnvironment(clientId, clientSecret)
            : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    }
    async getSubscription(userId) {
        let subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription) {
            subscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    isPremium: false,
                },
            });
        }
        return subscription;
    }
    async upgradeToPremium(userId, paymentId) {
        return this.prisma.subscription.upsert({
            where: { userId },
            update: {
                isPremium: true,
                premiumSince: new Date(),
                paymentId,
            },
            create: {
                userId,
                isPremium: true,
                premiumSince: new Date(),
                paymentId,
            },
        });
    }
    async cancelPremium(userId) {
        return this.prisma.subscription.update({
            where: { userId },
            data: {
                isPremium: false,
                expiresAt: new Date(),
            },
        });
    }
    async createPayment(userId, createPaymentDto) {
        return this.prisma.payment.create({
            data: {
                userId,
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency || 'USD',
                paymentMethod: createPaymentDto.paymentMethod,
                status: 'PENDING',
            },
        });
    }
    async getPaymentHistory(userId) {
        return this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updatePaymentStatus(paymentId, status, transactionId) {
        return this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status,
                ...(transactionId && { transactionId }),
            },
        });
    }
    async createPayPalOrder(userId) {
        try {
            console.log('[Subscription Service] Creating PayPal order for user:', userId);
            const existingSubscription = await this.getSubscription(userId);
            if (existingSubscription?.isPremium) {
                console.log('[Subscription Service] ⚠️ User is already premium');
                throw new Error('You already have an active premium subscription');
            }
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: '9.99',
                        },
                        description: 'Premium Subscription - 1 Month',
                    },
                ],
                application_context: {
                    return_url: `${this.configService.get('CLIENT_URL', 'http://localhost:3000')}/subscription/success`,
                    cancel_url: `${this.configService.get('CLIENT_URL', 'http://localhost:3000')}/subscription/cancel`,
                    brand_name: 'DevColl',
                    user_action: 'PAY_NOW',
                },
            });
            console.log('[Subscription Service] Executing PayPal request...');
            const order = await this.paypalClient.execute(request);
            console.log('[Subscription Service] PayPal order created:', order.result.id);
            const approvalLink = order.result.links.find((link) => link.rel === 'approve')?.href;
            const result = {
                orderId: order.result.id,
                approvalLink,
                status: order.result.status,
            };
            try {
                console.log('[Subscription Service] Creating payment record...');
                await this.createPayment(userId, {
                    amount: 9.99,
                    currency: 'USD',
                    paymentMethod: 'PAYPAL',
                });
                console.log('[Subscription Service] Payment record created successfully');
            }
            catch (paymentError) {
                console.error('[Subscription Service] Failed to create payment record (non-critical):', paymentError.message);
                console.error('[Subscription Service] Payment record error stack:', paymentError.stack);
            }
            console.log('[Subscription Service] Returning PayPal order response:', result);
            return result;
        }
        catch (error) {
            console.error('[Subscription Service] PayPal order creation error:', error);
            console.error('[Subscription Service] Error details:', error.message);
            console.error('[Subscription Service] Error stack:', error.stack);
            throw error;
        }
    }
    async capturePayPalOrder(orderId, userId) {
        try {
            console.log('[Subscription Service] 💳 Capturing PayPal order:', { orderId, userId });
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            request.requestBody({});
            console.log('[Subscription Service] 📤 Executing PayPal capture request...');
            const capture = await this.paypalClient.execute(request);
            console.log('[Subscription Service] ✅ PayPal capture successful:', capture.result.status);
            console.log('[Subscription Service] ⬆️ Upgrading user to premium...');
            const subscription = await this.upgradeToPremium(userId, orderId);
            console.log('[Subscription Service] ✅ Subscription updated:', {
                userId: subscription.userId,
                isPremium: subscription.isPremium,
                premiumSince: subscription.premiumSince,
            });
            console.log('[Subscription Service] 🔍 Looking for pending payment...');
            const payment = await this.prisma.payment.findFirst({
                where: {
                    userId,
                    paymentMethod: 'PAYPAL',
                    status: 'PENDING',
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (payment) {
                console.log('[Subscription Service] 📝 Updating payment status to COMPLETED...');
                await this.updatePaymentStatus(payment.id, 'COMPLETED', orderId);
                console.log('[Subscription Service] ✅ Payment status updated');
            }
            else {
                console.log('[Subscription Service] ⚠️ No pending payment found for user');
            }
            const result = {
                orderId: capture.result.id,
                status: capture.result.status,
                captureId: capture.result.purchase_units[0]?.payments?.captures?.[0]?.id,
            };
            console.log('[Subscription Service] 🎉 Capture complete, returning result:', result);
            return result;
        }
        catch (error) {
            console.error('[Subscription Service] ❌ PayPal order capture error:', error);
            console.error('[Subscription Service] Error details:', error.message);
            throw error;
        }
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], SubscriptionService);


/***/ }),

/***/ ".prisma/client-subscription":
/*!**********************************************!*\
  !*** external ".prisma/client-subscription" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = require(".prisma/client-subscription");

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

/***/ "@paypal/checkout-server-sdk":
/*!**********************************************!*\
  !*** external "@paypal/checkout-server-sdk" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = require("@paypal/checkout-server-sdk");

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
/*!***********************************************!*\
  !*** ./apps/subscription-service/src/main.ts ***!
  \***********************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/subscription-service/src/app.module.ts");
async function bootstrap() {
    const logger = new common_1.Logger('SubscriptionService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('SUBSCRIPTION_SERVICE_PORT', 50057);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(port);
    logger.log(`💳 Subscription Service (HTTP) is running on port ${port}`);
}
bootstrap();

})();

/******/ })()
;