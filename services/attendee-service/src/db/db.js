import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendee_db",
  password: "shomi777",
  port: 5432,
});

export default pool;