import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/is-public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      // Uptime of the Node.js process in seconds
      uptime: process.uptime(),
    };
  }
}
