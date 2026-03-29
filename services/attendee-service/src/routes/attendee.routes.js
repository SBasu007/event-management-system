import express from "express";
import * as controller from "../controllers/attendee.controller.js";

const router = express.Router();

router.post("/book", controller.book);
router.get("/event/:eventId", controller.getByEvent);
router.get("/user/:userId", controller.getByUser);
router.delete("/:id", controller.cancel);

export default router;