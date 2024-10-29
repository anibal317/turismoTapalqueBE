import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { StaticFilesMiddleware } from './static.middleware';
import { Logger } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Registra el middleware antes de todas las rutas
  app.use('/templates', new StaticFilesMiddleware().use);

  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }
  ))

  // Simplifica la configuración de CORS
  app.enableCors({
    origin: 'https://tapalque.tur.ar',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Authentication'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // app.use((req, res, next) => {
  //   console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
  //   console.log(`Request Method: ${req.method}`);
  //   next();
  // });

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
  });

  // app.enableCors({
  //   // origin: ['https://tapalque.tur.ar/', 'http://localhost:3000', 'localhost','https://turismo-tapalque-be.vercel.app/auth/login','https://turismo-tapalque-be.vercel.app'],
  //   origin:'*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  //   allowedHeaders: 'application/json, Origin, X-Requested-With, Content-Type, Accept, Authorization, Authentication, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
  //     // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  // });



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
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('http://localhost:3001')
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
