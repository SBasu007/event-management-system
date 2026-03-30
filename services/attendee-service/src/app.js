import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendeeRoutes from "./routes/attendee.routes.js";
import { createTables } from "./db/init.js";

dotenv.config({
  path: "../../.env",
});

const app = express();
const attendeePort = Number(process.env.ATTENDEE_SERVICE_PORT || 5004);

app.use(cors());
app.use(express.json());

app.use("/attendees", attendeeRoutes);

const start = async () => {
  await createTables();

  app.listen(attendeePort, () => {
    console.log(`Attendee service running on port ${attendeePort}`);
  });
};

start();