import { DynamicModule } from '@nestjs/common';
export interface RabbitMQModuleOptions {
    name: string;
    queue: string;
}
export declare class RabbitMQModule {
    static register(options: RabbitMQModuleOptions): DynamicModule;
}
