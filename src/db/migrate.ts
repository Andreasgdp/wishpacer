import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '../server/db/client';

async function runMigrate() {
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Database migrations completed successfully!');
}

runMigrate().catch(err => {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('already exists')) {
    console.log('Database tables already exist.');
  } else {
    console.error('Migration failed:', err);
    process.exit(1);
  }
});
