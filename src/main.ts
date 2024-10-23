import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedirectMiddleware } from './redirect.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }
  ))


  // Obtener los orígenes permitidos desde las variables de entorno
  let allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido para este origen'));
      }
    },
    // origin:['*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-control-allow-credentials, Access-control-allow-headers, Access-control-allow-methods, Access-control-allow-origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
  });

  // Aplica el middleware globalmente
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

    // Eliminar todos los schemas del documento
    document.components.schemas = {};

    // Eliminar el endpoint principal
    delete document.paths['/'];

    const theme = new SwaggerTheme();
    const options = {
      explorer: true,
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI),
      securityRequirements: [{ bearer: [] }],
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        tagsSorter: 'alpha',
      },
    };

    SwaggerModule.setup('/docs', app, document, options);
  }

  Swagger();
  await app.listen(3001);
  console.log('http://localhost:3001')
}
bootstrap();
