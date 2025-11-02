"use strict";
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
var JwtMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
let JwtMiddleware = JwtMiddleware_1 = class JwtMiddleware {
    constructor() {
        this.logger = new common_1.Logger(JwtMiddleware_1.name);
    }
    use(req, res, next) {
        this.logger.debug(`[JWT Middleware] Processing request: ${req.method} ${req.path}`);
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            this.logger.debug('[JWT Middleware] No authorization header found');
            return next();
        }
        this.logger.debug(`[JWT Middleware] Authorization header found: ${authHeader.substring(0, 20)}...`);
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            this.logger.warn('[JWT Middleware] Invalid authorization header format');
            return next();
        }
        const token = parts[1];
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.sub) {
                this.logger.warn('[JWT Middleware] Invalid token payload');
                return next();
            }
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                this.logger.warn('[JWT Middleware] Token expired');
                return next();
            }
            req.user = {
                userId: decoded.sub,
                email: decoded.email,
            };
            this.logger.log(`[JWT Middleware] ✅ User authenticated: ${decoded.sub}`);
            next();
        }
        catch (error) {
            this.logger.error(`[JWT Middleware] JWT decode error: ${error.message}`);
            next();
        }
    }
};
exports.JwtMiddleware = JwtMiddleware;
exports.JwtMiddleware = JwtMiddleware = JwtMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], JwtMiddleware);
//# sourceMappingURL=jwt.middleware.js.map