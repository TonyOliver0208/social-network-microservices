"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
exports.generateId = generateId;
exports.slugify = slugify;
exports.calculatePagination = calculatePagination;
const common_1 = require("@nestjs/common");
class AppLogger extends common_1.Logger {
    error(message, trace, context) {
        super.error(message, trace, context || this.context);
    }
    warn(message, context) {
        super.warn(message, context || this.context);
    }
    log(message, context) {
        super.log(message, context || this.context);
    }
    debug(message, context) {
        super.debug(message, context || this.context);
    }
    verbose(message, context) {
        super.verbose(message, context || this.context);
    }
}
exports.AppLogger = AppLogger;
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}
function calculatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
//# sourceMappingURL=index.js.map