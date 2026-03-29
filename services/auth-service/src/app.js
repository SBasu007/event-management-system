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

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await createDatabaseIfNotExists();
  await createTables();

  app.use("/auth", authRoutes);

  app.listen(5001, () => {
    console.log("Auth Service running on 5001");
  });
};

startServer();