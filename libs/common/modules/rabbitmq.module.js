"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMQModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
let RabbitMQModule = RabbitMQModule_1 = class RabbitMQModule {
    static register(options) {
        return {
            module: RabbitMQModule_1,
            imports: [
                microservices_1.ClientsModule.registerAsync([
                    {
                        name: options.name,
                        useFactory: (configService) => ({
                            transport: microservices_1.Transport.RMQ,
                            options: {
                                urls: [configService.get('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
                                queue: options.queue,
                                queueOptions: {
                                    durable: true,
                                },
                                prefetchCount: 1,
                            },
                        }),
                        inject: [config_1.ConfigService],
                    },
                ]),
            ],
            exports: [microservices_1.ClientsModule],
        };
    }
};
exports.RabbitMQModule = RabbitMQModule;
exports.RabbitMQModule = RabbitMQModule = RabbitMQModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], RabbitMQModule);
//# sourceMappingURL=rabbitmq.module.js.map