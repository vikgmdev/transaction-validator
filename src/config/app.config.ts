import 'dotenv/config';
import { registerAs } from '@nestjs/config';
import { getEnvVar } from './get-env-var.util';

export const AppConfig = registerAs('app', () => ({
  NODE_ENV: getEnvVar('NODE_ENV'),
  PORT: +getEnvVar('PORT'),

  JWT_SECRET: getEnvVar('JWT_SECRET'),
}));
