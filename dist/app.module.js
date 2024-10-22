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
const app_controller_1 = require("./app.controller");
const typeorm_1 = require("@nestjs/typeorm");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const movies_module_1 = require("./movies/movies.module");
const city_point_of_interest_module_1 = require("./city-point-of-interest/city-point-of-interest.module");
const type_entity_module_1 = require("./type-entity/type-entity.module");
const subtype_entity_module_1 = require("./subtype-entity/subtype-entity.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const mailer_module_1 = require("./mailer/mailer.module");
const emails_module_1 = require("./emails/emails.module");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT, 10) || 3306,
                database: process.env.DB_NAME || 'turismo',
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || 'root',
                autoLoadEntities: true,
                synchronize: true,
                logging: true
            }),
            movies_module_1.MoviesModule,
            city_point_of_interest_module_1.CityPointOfInterestModule,
            type_entity_module_1.TypeEntityModule,
            subtype_entity_module_1.SubtypeEntityModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            mailer_module_1.MailerCustomModule,
            emails_module_1.SentEmailsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, roles_guard_1.RolesGuard],
        exports: [typeorm_1.TypeOrmModule]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map