import { Router } from "express";
import { evaluateAttemptController } from "./evaluation.controller";

const router = Router();

router.post(
  "/:attemptId",
  evaluateAttemptController
);

export default router;