import 'dotenv/config';
import { registerAs } from '@nestjs/config';
import { getEnvVar } from './get-env-var.util';

export const DatabaseConfig = registerAs('db', () => ({
  PG_HOST: getEnvVar('PG_HOST', 'localhost'),
  PG_PORT: +getEnvVar('PG_PORT', '5432'),
  PG_USER: getEnvVar('PG_USER', 'postgres'),
  PG_PASSWORD: getEnvVar('PG_PASSWORD', 'password'),
  PG_DATABASE: getEnvVar('PG_DATABASE', 'test'),
}));
