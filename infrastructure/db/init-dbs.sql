CREATE DATABASE auth_db;
CREATE DATABASE attendee_db;
CREATE DATABASE event_db;
CREATE DATABASE budget_db;

\connect auth_db
CREATE EXTENSION IF NOT EXISTS pgcrypto;