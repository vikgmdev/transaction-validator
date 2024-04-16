import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../src/config/config.service';
import { getDataSourceOptions } from '../src/ormconfig';
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

async function truncateAllTablesAndResetSequences() {
  const dataSource = await databaseSetup();

  // Disable foreign key checks to avoid constraint errors
  await dataSource.query(`SET session_replication_role = 'replica';`);

  // Fetch all table names
  const tables = await dataSource.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
    `);

  // Truncate all tables and reset their sequences
  for (const table of tables) {
    await dataSource.query(
      `TRUNCATE TABLE "public"."${table.tablename}" CASCADE;`,
    );
    // Reset the sequence associated with this table, assuming the sequence name follows the standard naming convention
    await dataSource.query(
      `ALTER SEQUENCE "public"."${table.tablename}_id_seq" RESTART WITH 1;`,
    );
  }

  // Re-enable foreign key checks
  await dataSource.query(`SET session_replication_role = 'origin';`);

  console.log('All tables truncated and sequences reset successfully!');
  await dataSource.destroy();
}

truncateAllTablesAndResetSequences().catch((error) => {
  console.error('Error truncating tables and resetting sequences:', error);
  process.exit(1);
});
