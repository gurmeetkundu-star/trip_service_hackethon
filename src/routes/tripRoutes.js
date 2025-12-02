import express from "express";
import { TripController } from "../controllers/tripController.js";

const router = express.Router();

router.get("/", TripController.getAll);
router.get("/:id", TripController.get);
router.post("/", TripController.create);
router.put("/:id", TripController.update);
router.delete("/:id", TripController.delete);

export default router;
