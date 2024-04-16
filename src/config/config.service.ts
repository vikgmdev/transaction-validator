import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppConfig } from './app.config';
import { DatabaseConfig } from './db.config';

@Injectable()
export class AppConfigService {
  constructor(
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
    @Inject(DatabaseConfig.KEY)
    private databaseConfig: ConfigType<typeof DatabaseConfig>,
  ) {}

  get app(): ConfigType<typeof AppConfig> {
    return this.appConfig;
  }

  get db(): ConfigType<typeof DatabaseConfig> {
    return this.databaseConfig;
  }
}
