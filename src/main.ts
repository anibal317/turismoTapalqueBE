import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedirectMiddleware } from './redirect.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let app: any;

async function bootstrap() {
  if (!app) {
    const server = express();
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    const configService = app.get(ConfigService);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false
    }));

    const corsAllowedOrigins = configService.get('CORS_ALLOWED_ORIGINS');
    let allowedOrigins = corsAllowedOrigins ? corsAllowedOrigins.split(',') : [];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('CORS no permitido para este origen'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-control-allow-credentials, Access-control-allow-headers, Access-control-allow-methods, Access-control-allow-origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
    });

    app.use(new RedirectMiddleware().use);

    function Swagger() {
      const config = new DocumentBuilder()
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
    
      const document = SwaggerModule.createDocument(app, config, {
        extraModels: [],
        ignoreGlobalPrefix: true,
        deepScanRoutes: true,
      });
    
      document.components.schemas = {};
    
      const theme = new SwaggerTheme();
      const options = {
        explorer: true,
        customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI),
        securityRequirements: [{ bearer: [] }],
      };
      SwaggerModule.setup('/docs', app, document, options);
    }

    Swagger();
    await app.init();
  }

  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  server(req, res);
}