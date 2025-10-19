import { DynamicModule } from '@nestjs/common';
export interface GrpcModuleOptions {
    name: string;
    package: string;
    protoFileName: string;
    urlConfigKey: string;
    defaultUrl: string;
}
export declare class GrpcModule {
    static register(options: GrpcModuleOptions): DynamicModule;
}
