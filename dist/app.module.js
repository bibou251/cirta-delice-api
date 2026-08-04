"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    if (process.env.DATABASE_URL) {
                        return {
                            type: 'postgres',
                            url: process.env.DATABASE_URL,
                            autoLoadEntities: true,
                            synchronize: process.env.TYPEORM_SYNC === 'true',
                            ssl: { rejectUnauthorized: false },
                        };
                    }
                    const isRemote = process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost';
                    return {
                        type: 'postgres',
                        host: process.env.DB_HOST || 'localhost',
                        port: parseInt(process.env.DB_PORT || '5432', 10),
                        username: process.env.DB_USERNAME || 'cirta',
                        password: process.env.DB_PASSWORD || 'cirta_secret',
                        database: process.env.DB_DATABASE || 'cirta',
                        autoLoadEntities: true,
                        synchronize: process.env.TYPEORM_SYNC === 'true',
                        ssl: isRemote ? { rejectUnauthorized: false } : false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map