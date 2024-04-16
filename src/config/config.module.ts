import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './app.config';
import { AppConfigService } from './config.service';
import { DatabaseConfig } from './db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfig, DatabaseConfig],
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
