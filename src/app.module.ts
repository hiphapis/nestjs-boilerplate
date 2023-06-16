import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { isServer } from 'config/env.helper';
import EnvServerConfig from '../config/env.server.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { ArticlesModule } from './articles/articles.module';
import { CommonModule } from './common/common.module';
import loggerConfig from 'config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvServerConfig],
      isGlobal: true,
      ignoreEnvFile: isServer,
    }),
    LoggerModule.forRoot(loggerConfig()),
    HealthModule,
    ArticlesModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
