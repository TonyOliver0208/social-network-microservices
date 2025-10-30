"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GrpcModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
let GrpcModule = GrpcModule_1 = class GrpcModule {
    static register(options) {
        return {
            module: GrpcModule_1,
            imports: [
                microservices_1.ClientsModule.registerAsync([
                    {
                        name: options.name,
                        useFactory: (configService) => ({
                            transport: microservices_1.Transport.GRPC,
                            options: {
                                url: configService.get(options.urlConfigKey) || options.defaultUrl,
                                package: options.package,
                                protoPath: (0, path_1.join)(__dirname, '..', '..', '..', 'proto', options.protoFileName),
                                loader: {
                                    keepCase: true,
                                    longs: String,
                                    enums: String,
                                    defaults: true,
                                    oneofs: true,
                                },
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
exports.GrpcModule = GrpcModule;
exports.GrpcModule = GrpcModule = GrpcModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], GrpcModule);
//# sourceMappingURL=grpc.module.js.map