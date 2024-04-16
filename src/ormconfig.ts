import { DataSourceOptions } from 'typeorm';
import { AppConfigService } from './config/config.service';

export function getDataSourceOptions(
  configService: AppConfigService,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: configService.db.PG_HOST,
    port: configService.db.PG_PORT,
    username: configService.db.PG_USER,
    password: configService.db.PG_PASSWORD,
    database: configService.db.PG_DATABASE,
    synchronize: true,
    logging: false,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
  };
}
