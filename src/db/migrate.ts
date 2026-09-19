import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './client';

async function runMigrate() {
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Database migrations completed successfully!');
}

runMigrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
