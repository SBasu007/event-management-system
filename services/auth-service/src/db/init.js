import pkg from "pg";
const { Client } = pkg;

const DB_NAME = "auth_db";

const config = {
  user: "postgres",
  host: "localhost",
  password: "shomi777",
  port: 5432,
};

export const createDatabaseIfNotExists = async () => {
  const client = new Client({ ...config, database: "postgres" });

  await client.connect();

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME]
  );

  if (res.rowCount === 0) {
    console.log("Creating auth_db...");
    await client.query(`CREATE DATABASE ${DB_NAME}`);
  } else {
    console.log("auth_db exists");
  }

  await client.end();
};

export const createTables = async () => {
  const client = new Client({ ...config, database: DB_NAME });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_attendee BOOLEAN DEFAULT FALSE,
      is_organizer BOOLEAN DEFAULT FALSE,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Users table ready");

  await client.end();
};