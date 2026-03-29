import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, "../../../.env")});

export const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL,
  EVENT: process.env.EVENT_SERVICE_URL,
  BUDGET: process.env.BUDGET_SERVICE_URL,
  ATTENDEE: process.env.ATTENDEE_SERVICE_URL,
};