"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redirect_middleware_1 = require("./redirect.middleware");
const swagger_1 = require("@nestjs/swagger");
const swagger_themes_1 = require("swagger-themes");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: false
    }));
    let allowedOrigins = configService.get('CORS_ALLOWED_ORIGINS')?.split(',');
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('CORS no permitido para este origen'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-control-allow-credentials, Access-control-allow-headers, Access-control-allow-methods, Access-control-allow-origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
    });
    app.use(new redirect_middleware_1.RedirectMiddleware().use);
    function Swagger() {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Tapalque Turismo - Api')
            .setDescription('Documentación API para el sitio de Turismo Tapalque')
            .addServer(`http://localhost:3001/`, 'Ambiente Local')
            .addServer('https://staging.yourapi.com/', 'Staging')
            .addServer('https://production.yourapi.com/', 'Production')
            .addBearerAuth({
            description: `[just text field] Please enter token in following format: Bearer <JWT>`,
            name: 'Authorization',
            bearerFormat: 'JWT',
            scheme: 'Bearer',
            type: 'http',
            in: 'Header'
        }, 'access-token')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config, {
            extraModels: [],
            ignoreGlobalPrefix: true,
            deepScanRoutes: true,
        });
        document.components.schemas = {};
        delete document.paths['/'];
        const theme = new swagger_themes_1.SwaggerTheme();
        const options = {
            explorer: true,
            customCss: theme.getBuffer(swagger_themes_1.SwaggerThemeNameEnum.DARK_MONOKAI),
            securityRequirements: [{ bearer: [] }],
            swaggerOptions: {
                defaultModelsExpandDepth: -1,
                tagsSorter: 'alpha',
            },
        };
        swagger_1.SwaggerModule.setup('/docs', app, document, options);
    }
    Swagger();
    await app.listen(3001);
    console.log('http://localhost:3001');
}
bootstrap();
//# sourceMappingURL=main.js.map