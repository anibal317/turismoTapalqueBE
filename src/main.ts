import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedirectMiddleware } from './redirect.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { StaticFilesMiddleware } from './static.middleware';
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import { CorsMiddleware } from './cors.middleware';

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


  // Obtener los orígenes permitidos desde las variables de entorno
  app.enableCors((req, callback) => {
    const corsOptions = {
      origin: (origin, cb) => {
        // Log to check which origin is received
        console.log('Request Origin:', origin);
        if (origin && ['https://tapalque.tur.ar/', 'http://localhost:3000', 'locahost','https://turismo-tapalque-be.vercel.app/auth/login','https://turismo-tapalque-be.vercel.app'].includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    };
    callback(null, corsOptions);
  });
  

  // app.enableCors({
  //   origin: ['https://tapalque.tur.ar/', 'http://localhost:3000', 'locahost','https://turismo-tapalque-be.vercel.app/auth/login','https://turismo-tapalque-be.vercel.app'],
  //   // origin:['*'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  //   allowedHeaders: 'application/json, Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
  // });
  app.use(new CorsMiddleware().use);
  app.enableCors({
    origin: [
      'https://tapalque.tur.ar',
      'http://localhost:3000',
      'https://turismo-tapalque-be.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'X-CSRF-Token', 
      'X-Requested-With', 
      'Accept', 
      'Accept-Version', 
      'Content-Length', 
      'Content-MD5', 
      'Content-Type', 
      'Date', 
      'X-Api-Version',
      'Origin', 
      'Authorization'
    ].join(', '),
  });

  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', '*');
  //   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  //   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //   res.setHeader('Access-Control-Allow-Credentials', 'true');
  //   if (req.method === 'OPTIONS') {
  //     return res.sendStatus(204);
  //   }
  //   next();
  // });
  

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
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('http://localhost:3001')
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
