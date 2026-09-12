import { Request, Response } from "express";
import {
  compareAttempts,
  createAttempt,
  getAttemptById,
  getAttemptsByProblem
} from "./attempt.service";

export async function createAttemptController(
  req: Request,
  res: Response
) {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "problemId is required",
      });
    }

    const attempt = await createAttempt(problemId);

    return res.status(201).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Problem not found") {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create attempt",
    });
  }
}
export async function getAttemptController(
  req: Request,
  res: Response
) {
  const attempt = await getAttemptById(req.params.id as string);

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found",
    });
  }

  return res.json({
    success: true,
    data: attempt,
  });
}
export async function getProblemAttempts(
  req: Request,
  res: Response
) {
  try {
    const problemId = req.params.problemId as string;

    const attempts = await getAttemptsByProblem(problemId);

    return res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Get attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get attempts",
    });
  }
}
export async function compareProblemAttempts(
  req: Request,
  res: Response
) {
  try {
    const problemId = req.params.problemId as string;

    const result = await compareAttempts(problemId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Compare attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to compare attempts",
    });
  }
}