import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
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

   // Configuración de CORS - DEBE IR PRIMERO
   app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://tapalque.tur.ar');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Middleware para logging detallado
  app.use((req, res, next) => {
    console.log('Request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers
    });
    next();
  });


  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      validateCustomDecorators: true,
      stopAtFirstError: false, // Cambiado a false para ver todos los errores
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {})
        }));
        console.log('Validation Errors:', JSON.stringify(messages, null, 2));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages
        });
      }
    }));



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



  // Middleware para logging (opcional, para debugging)
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
  });




  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('http://localhost:3001')
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
