import { Request, Response } from "express";
import { submitSolution } from "./submission.service";

export async function submitSolutionController(
  req: Request,
  res: Response
) {
  try {
    const attemptId = req.params.attemptId as string;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Submission content is required",
      });
    }

    const submission = await submitSolution(attemptId, content);

    return res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Attempt not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Attempt already submitted"
    ) {
      return res.status(409).json({
        success: false,
        message: "Attempt already submitted",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit solution",
    });
  }
}