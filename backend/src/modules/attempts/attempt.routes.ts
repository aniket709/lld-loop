import { Router } from "express";
import {
  compareProblemAttempts,
  createAttemptController,
  getAttemptController,
  getProblemAttempts,
} from "./attempt.controller";

const router = Router();

router.post("/", createAttemptController);
router.get("/:id", getAttemptController);
router.get(
  "/problem/:problemId",
  getProblemAttempts
);
router.get(
  "/problem/:problemId/compare",
  compareProblemAttempts
);

export default router;