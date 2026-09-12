import { Request, Response } from "express";
import { evaluateAttempt } from "./evaluation.service";
import { LLMEvaluator } from "./llmEvaluator";

export async function evaluateAttemptController(
  req: Request,
  res: Response
) {
  try {
    const attemptId = req.params.attemptId as string;

    const evaluator = new LLMEvaluator();;

    const attempt = await evaluateAttempt(
      attemptId,
      evaluator
    );

    return res.json({
      success: true,
      data: attempt,
    });
  }    catch (error) {
    if (error instanceof Error) {
      if (error.message === "Attempt not found") {
        return res.status(404).json({
          success: false,
          message: "Attempt not found",
        });
      }

      if (error.message === "Submission not found") {
        return res.status(400).json({
          success: false,
          message: "Submit a solution before evaluation",
        });
      }

      if (
        error.message ===
        "Attempt is not ready for evaluation"
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Evaluation error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Evaluation failed",
    });
  }
}
