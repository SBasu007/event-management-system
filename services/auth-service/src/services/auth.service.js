import pool from "../db/db.js";
import bcrypt from "bcrypt";

export const registerUser = async ({ name, email, password, is_attendee, is_organizer, is_admin, contact }) => {

  const hashed = await bcrypt.hash(password, 10);
  //Default checking for roles if not provided
  const attendee = is_attendee ?? false;
  const organizer = is_organizer ?? false;
  const admin = is_admin ?? false;
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, is_attendee, is_organizer, is_admin, contact)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, email, hashed, attendee, organizer, admin, contact]
  );

  return result.rows[0];
};

export const loginUser = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  return user;
};

export const loginAdminUser = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT * FROM admin_users WHERE email=$1",
    [email]
  );

  const admin = result.rows[0];
  if (!admin) throw new Error("Admin user not found");

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  return admin;
};

export const getAdminUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM admin_users WHERE id=$1",
    [id]
  );

  return result.rows[0];
};

// GET USER BY ID
export const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, is_attendee, is_organizer, is_admin, contact FROM users WHERE id=$1",
    [id]
  );

  return result.rows[0];
};

// UPDATE USER
export const updateUserService = async (id, data) => {
  const { name, password, contact } = data;

  if (password) {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `UPDATE users 
       SET name=$1, password_hash=$2, contact=$3
       WHERE id=$4 
       RETURNING id, name, email, is_attendee, is_organizer, is_admin, contact`,
      [name, hashed, contact, id]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `UPDATE users 
     SET name=$1, contact=$2
     WHERE id=$3 
     RETURNING id, name, email, is_attendee, is_organizer, is_admin, contact`,
    [name, contact, id]
  );

  return result.rows[0];
};

