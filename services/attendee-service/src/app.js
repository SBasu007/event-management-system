import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendeeRoutes from "./routes/attendee.routes.js";
import { createTables } from "./db/init.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/attendees", attendeeRoutes);

const start = async () => {
  await createTables();

  app.listen(5004, () => {
    console.log(`Attendee service running on port 5004`);
  });
};

start();