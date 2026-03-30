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

const defaultMessageByMethod = {
  GET: "Data fetched successfully",
  POST: "Resource created successfully",
  PUT: "Resource updated successfully",
  PATCH: "Resource updated successfully",
  DELETE: "Resource deleted successfully",
};

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const statusCode = res.statusCode || 200;
    const isError = statusCode >= 400;
    const payloadObj = payload && typeof payload === "object" ? payload : null;

    if (payloadObj?.status && payloadObj?.message) {
      return originalJson(payloadObj);
    }

    if (isError) {
      const derivedMessage =
        payloadObj?.message || payloadObj?.error || "Request failed";

      return originalJson({
        status: "error",
        message: derivedMessage,
        error: payloadObj || null,
      });
    }

    const derivedMessage =
      payloadObj?.message || defaultMessageByMethod[req.method] || "Request successful";

    return originalJson({
      status: "success",
      message: derivedMessage,
      data: payload,
    });
  };

  next();
});

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