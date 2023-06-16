import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyHelmet from '@fastify/helmet';

import tracer from 'dd-trace';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { SentryInterceptor } from 'lib/sentry.interceptor';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from '@nestjs/common';

import { ConfigType } from '@nestjs/config';
import EnvServerConfig from '../config/env.server.config';
import { LoggerErrorInterceptor, Logger as PinoLogger } from 'nestjs-pino';
import { RewriteFrames } from '@sentry/integrations';


async function bootstrap() {
  if (!process.env.NODE_ENV) {
    console.error('NODE_ENV required. Please set NODE_ENV.');
    process.exit(1);
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    // 초기 부팅땐 nestjs logger가 사용되는데, 이때도 pino logger쓰도록
    // 근데 이 옵션 쓰니 Prisma사용시 Max callstack뜸..;;
    // { bufferLogs: true },
  );

  // Envs
  const config = app.get<ConfigType<typeof EnvServerConfig>>(
    EnvServerConfig.KEY,
  );
  const NODE_ENV = config.NODE_ENV;
  const PORT = config.PORT;

  // Default Server settings
  app.enableCors();
  app.enableShutdownHooks();
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SNS Nest API')
    .setDescription('원티드 SNS Nest API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);


  // DataDog
  tracer.init({
    env: NODE_ENV,
    logInjection: true,
    tags: { app: 'sns-nest-api' },
  });

  // Sentry
  Sentry.init({
    dsn: 'https://0d60bcf97f3d46dcb411f2081165eec9@o40591.ingest.sentry.io/4505326866006016',
    tracesSampleRate: 1.0,
    environment: NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new ProfilingIntegration(),
      new RewriteFrames({
        root: global.__dirname,
        // prefix: '~',
      }),
    ],
    profilesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler({ ip: true }));
  app.use(Sentry.Handlers.tracingHandler());
  app.useGlobalInterceptors(new SentryInterceptor());

  // Logger
  app.useLogger(app.get(PinoLogger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Boot!!!
  await app.listen(PORT, '0.0.0.0');
  const logger = new Logger('Default Logger');
  logger.log(
    `🚀🚀🚀 SNS-NEST-API Server started!(${NODE_ENV}, ${PORT}) 🚀🚀🚀`,
  );
}
bootstrap();
