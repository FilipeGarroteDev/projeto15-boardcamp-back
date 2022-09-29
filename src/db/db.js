import pg from 'pg';

const { Pool } = pg;

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: 'postgres',
  password: '123456',
  database: 'boardcamp',
});

export { connection };
