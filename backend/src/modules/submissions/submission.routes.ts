import { Router } from "express";
import { submitSolutionController } from "../submissions/submission.controller";

const router = Router();

router.post(
  "/:attemptId",
  submitSolutionController
);

export default router;