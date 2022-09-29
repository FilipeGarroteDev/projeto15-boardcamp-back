import pg from 'pg';

const { Pool } = pg;

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

export { connection };
