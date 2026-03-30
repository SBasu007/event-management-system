import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

dotenv.config({
  path: "../../.env", 
});
import {
  createDatabaseIfNotExists,
  createTables,
} from "./db/init.js";


const app = express();
const authPort = Number(process.env.AUTH_SERVICE_PORT || 5001);

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await createTables();

  app.use("/auth", authRoutes);

  app.listen(authPort, () => {
    console.log(`Auth Service running on ${authPort}`);
  });
};

startServer();