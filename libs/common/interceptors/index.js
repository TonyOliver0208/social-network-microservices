"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const now = Date.now();
        this.logger.log(`Incoming Request: ${method} ${url}`);
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const response = context.switchToHttp().getResponse();
                const delay = Date.now() - now;
                this.logger.log(`Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms`);
            },
            error: (error) => {
                const delay = Date.now() - now;
                this.logger.error(`Error Response: ${method} ${url} ${error.status || 500} - ${delay}ms`, error.stack);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)((data) => {
            if (data && typeof data === 'object' && !data.success) {
                return {
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                };
            }
            return data;
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=index.js.map