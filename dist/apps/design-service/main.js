/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/design-service/src/app.module.ts":
/*!***********************************************!*\
  !*** ./apps/design-service/src/app.module.ts ***!
  \***********************************************/
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
const prisma_module_1 = __webpack_require__(/*! ./prisma/prisma.module */ "./apps/design-service/src/prisma/prisma.module.ts");
const design_module_1 = __webpack_require__(/*! ./design/design.module */ "./apps/design-service/src/design/design.module.ts");
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
            design_module_1.DesignModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/design-service/src/design/design.controller.ts":
/*!*************************************************************!*\
  !*** ./apps/design-service/src/design/design.controller.ts ***!
  \*************************************************************/
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
exports.DesignController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const design_service_1 = __webpack_require__(/*! ./design.service */ "./apps/design-service/src/design/design.service.ts");
let DesignController = class DesignController {
    constructor(designService) {
        this.designService = designService;
    }
    async getUserDesigns(userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const designs = await this.designService.getUserDesigns(userId);
            return {
                success: true,
                data: designs,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch designs', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDesignById(userId, designId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const design = await this.designService.getUserDesignById(userId, designId);
            return {
                success: true,
                data: design,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Design not found', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createDesign(userIdQuery, body) {
        try {
            const userId = userIdQuery || body.userId;
            if (!userId || !body.name) {
                throw new common_1.HttpException('User ID and name are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const canvasData = body.canvasData || '{}';
            const design = await this.designService.createDesign(userId, {
                name: body.name,
                canvasData: canvasData,
                width: body.width,
                height: body.height,
                category: body.category,
            });
            return {
                success: true,
                data: design,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create design', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateDesign(designId, userIdQuery, body) {
        try {
            const userId = userIdQuery || body.userId;
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const design = await this.designService.updateDesign(userId, designId, {
                name: body.name,
                canvasData: body.canvasData,
                width: body.width,
                height: body.height,
                category: body.category,
            });
            return {
                success: true,
                data: design,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update design', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteDesign(designId, userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.designService.deleteDesign(userId, designId);
            return {
                success: true,
                message: 'Design deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete design', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DesignController = DesignController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DesignController.prototype, "getUserDesigns", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DesignController.prototype, "getDesignById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DesignController.prototype, "createDesign", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DesignController.prototype, "updateDesign", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DesignController.prototype, "deleteDesign", null);
exports.DesignController = DesignController = __decorate([
    (0, common_1.Controller)('designs'),
    __metadata("design:paramtypes", [typeof (_a = typeof design_service_1.DesignService !== "undefined" && design_service_1.DesignService) === "function" ? _a : Object])
], DesignController);


/***/ }),

/***/ "./apps/design-service/src/design/design.module.ts":
/*!*********************************************************!*\
  !*** ./apps/design-service/src/design/design.module.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DesignModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const design_controller_1 = __webpack_require__(/*! ./design.controller */ "./apps/design-service/src/design/design.controller.ts");
const design_service_1 = __webpack_require__(/*! ./design.service */ "./apps/design-service/src/design/design.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./apps/design-service/src/prisma/prisma.module.ts");
let DesignModule = class DesignModule {
};
exports.DesignModule = DesignModule;
exports.DesignModule = DesignModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [design_controller_1.DesignController],
        providers: [design_service_1.DesignService],
        exports: [design_service_1.DesignService],
    })
], DesignModule);


/***/ }),

/***/ "./apps/design-service/src/design/design.service.ts":
/*!**********************************************************!*\
  !*** ./apps/design-service/src/design/design.service.ts ***!
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DesignService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./apps/design-service/src/prisma/prisma.service.ts");
let DesignService = class DesignService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserDesigns(userId) {
        return this.prisma.design.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getUserDesignById(userId, designId) {
        const design = await this.prisma.design.findFirst({
            where: {
                id: designId,
                userId,
            },
        });
        if (!design) {
            throw new common_1.NotFoundException('Design not found or you don\'t have permission to view it');
        }
        return design;
    }
    async createDesign(userId, createDesignDto) {
        return this.prisma.design.create({
            data: {
                userId,
                name: createDesignDto.name || 'Untitled Design',
                canvasData: createDesignDto.canvasData,
                width: createDesignDto.width,
                height: createDesignDto.height,
                category: createDesignDto.category,
            },
        });
    }
    async updateDesign(userId, designId, updateDesignDto) {
        const design = await this.prisma.design.findFirst({
            where: {
                id: designId,
                userId,
            },
        });
        if (!design) {
            throw new common_1.NotFoundException('Design not found or you don\'t have permission to update it');
        }
        return this.prisma.design.update({
            where: { id: designId },
            data: {
                ...(updateDesignDto.name && { name: updateDesignDto.name }),
                ...(updateDesignDto.canvasData && { canvasData: updateDesignDto.canvasData }),
                ...(updateDesignDto.width && { width: updateDesignDto.width }),
                ...(updateDesignDto.height && { height: updateDesignDto.height }),
                ...(updateDesignDto.category && { category: updateDesignDto.category }),
            },
        });
    }
    async deleteDesign(userId, designId) {
        const design = await this.prisma.design.findFirst({
            where: {
                id: designId,
                userId,
            },
        });
        if (!design) {
            throw new common_1.NotFoundException('Design not found or you don\'t have permission to delete it');
        }
        await this.prisma.design.delete({
            where: { id: designId },
        });
        return { message: 'Design deleted successfully' };
    }
};
exports.DesignService = DesignService;
exports.DesignService = DesignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], DesignService);


/***/ }),

/***/ "./apps/design-service/src/prisma/prisma.module.ts":
/*!*********************************************************!*\
  !*** ./apps/design-service/src/prisma/prisma.module.ts ***!
  \*********************************************************/
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
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./apps/design-service/src/prisma/prisma.service.ts");
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

/***/ "./apps/design-service/src/prisma/prisma.service.ts":
/*!**********************************************************!*\
  !*** ./apps/design-service/src/prisma/prisma.service.ts ***!
  \**********************************************************/
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
const client_design_1 = __webpack_require__(/*! .prisma/client-design */ ".prisma/client-design");
let PrismaService = class PrismaService extends client_design_1.PrismaClient {
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

/***/ ".prisma/client-design":
/*!****************************************!*\
  !*** external ".prisma/client-design" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require(".prisma/client-design");

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
/*!*****************************************!*\
  !*** ./apps/design-service/src/main.ts ***!
  \*****************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/design-service/src/app.module.ts");
async function bootstrap() {
    const logger = new common_1.Logger('DesignService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('DESIGN_SERVICE_PORT', 50056);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(port);
    logger.log(`🎨 Design Service (HTTP) is running on port ${port}`);
}
bootstrap();

})();

/******/ })()
;