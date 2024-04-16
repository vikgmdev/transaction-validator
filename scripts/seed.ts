import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { AppConfigService } from '../src/config/config.service';
import { getDataSourceOptions } from '../src/ormconfig';
import { User } from '../src/users/entities/user.entity';
import { Denom } from '../src/denoms/entities/denom.entity';
import { Balance } from '../src/balances/entities/balance.entity';
import { DatabaseConfig } from '../src/config/db.config';
import { AppConfig } from '../src/config/app.config';

async function databaseSetup(): Promise<DataSource> {
  const appConfig = AppConfig();
  const databaseConfig = DatabaseConfig();
  const configService = new AppConfigService(appConfig, databaseConfig);

  const dataSourceOptions = getDataSourceOptions(configService);
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  return dataSource;
}

async function seedDatabase() {
  const dataSource = await databaseSetup();
  const userRepository = dataSource.getRepository(User);
  const denomRepository = dataSource.getRepository(Denom);
  const balanceRepository = dataSource.getRepository(Balance);

  // Example seed data for denominations
  const btc = denomRepository.create({ ticker: 'BTC' });
  const eth = denomRepository.create({ ticker: 'ETH' });
  await denomRepository.save([btc, eth]);

  // Create specific users
  const usersData = [
    { id: 1, username: 'admin', password: 'passadmin', isAdmin: true },
    { id: 2, username: 'john', password: 'passjohn', isAdmin: false },
    { id: 3, username: 'kelly', password: 'passkelly', isAdmin: false },
  ];

  const hashedUsers = await Promise.all(
    usersData.map(async (user) => ({
      ...user,
      password: await argon2.hash(user.password), // Hash passwords
    })),
  );

  const users = userRepository.create(hashedUsers);
  await userRepository.save(users);

  // Assign each non-admin user a balance of 10000 BTC and ETH
  const balances = users
    .filter((user) => !user.isAdmin)
    .flatMap((user) => [
      balanceRepository.create({ user, denom: btc, amount: 10000 }),
      balanceRepository.create({ user, denom: eth, amount: 10000 }),
    ]);

  await balanceRepository.save(balances);

  console.log('Database seeded successfully!');
  await dataSource.destroy();
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
