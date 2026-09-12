import { Request, Response } from "express";
import {
  getAllProblems,
  getProblemById,
} from "./problem.service";

export async function getProblems(
  req: Request,
  res: Response
) {
  const problems = await getAllProblems();

  res.json({
    success: true,
    data: problems,
  });
}

export async function getProblem(
  req: Request,
  res: Response
) {
  const problem = await getProblemById(req.params.id as string);

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: "Problem not found",
    });
  }

  res.json({
    success: true,
    data: problem,
  });
}