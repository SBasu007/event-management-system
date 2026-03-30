import pkg from "pg";
import bcrypt from "bcrypt";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      contact VARCHAR(13)
    );
  `);

  await client.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS contact VARCHAR(13);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Platform Admin";

  if (adminEmail && adminPassword) {
    const existingAdmin = await client.query(
      "SELECT id FROM admin_users WHERE email=$1",
      [adminEmail]
    );

    if (existingAdmin.rowCount === 0) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `INSERT INTO admin_users (name, email, password_hash)
         VALUES ($1, $2, $3)`,
        [adminName, adminEmail, hashed]
      );
      console.log("Seeded admin_users with ADMIN_EMAIL account");
    }
  }

  console.log("Users and admin_users tables ready");

  await client.end();
};