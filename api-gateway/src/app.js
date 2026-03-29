import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, "../../.env")});

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import attendeeRoutes from "./routes/attendee.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// DEBUG
app.use((req, res, next) => {
  console.log(" Gateway:", req.method, req.url);
  next();
});


// ROUTES
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/budget", budgetRoutes);
app.use("/attendees", attendeeRoutes);

app.listen(5000, () => {
  console.log(" API Gateway running on 5000");
});