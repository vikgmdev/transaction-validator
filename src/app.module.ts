import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppConfigService } from './config/config.service';
import { DenomsModule } from './denoms/denoms.module';
import { BalancesModule } from './balances/balances.module';
import { getDataSourceOptions } from './ormconfig';
import { AdminGuard } from './common/guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (config: AppConfigService) =>
        getDataSourceOptions(config),
      inject: [AppConfigService],
    }),
    AppConfigModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    DenomsModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [
    // Enable the JwtAuthGuard globally, so all routes are protected by default. Use @Public() decorator to make a route public.
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AppModule {}
