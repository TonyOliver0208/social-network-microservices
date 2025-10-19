"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationId = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
exports.CorrelationId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-correlation-id'] || request.headers['x-request-id'];
});
//# sourceMappingURL=index.js.map