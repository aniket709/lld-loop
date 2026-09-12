import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { Evaluator } from "./evaluator";

export async function evaluateAttempt(
  attemptId: string,
  evaluator: Evaluator
) {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },
    include: {
      problem: true,
      submission: true,
      evaluation: true,
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (!attempt.submission) {
    throw new Error("Submission not found");
  }

  if (attempt.status === "COMPLETED") {
    return attempt;
  }

  if (attempt.status === "EVALUATING") {
    throw new Error("Evaluation already in progress");
  }

  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "FAILED"
  ) {
    throw new Error("Attempt is not ready for evaluation");
  }
  const claimed = await prisma.attempt.updateMany({
    where: {
      id: attemptId,
      status: {
        in: ["SUBMITTED", "FAILED"],
      },
    },
    data: {
      status: "EVALUATING",
      completedAt: null,
    },
  });

  if (claimed.count === 0) {
    const latestAttempt = await prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        submission: true,
        evaluation: true,
        problem: true,
      },
    });

    if (latestAttempt?.status === "COMPLETED") {
      return latestAttempt;
    }

    throw new Error("Evaluation already in progress");
  }

  await prisma.evaluation.upsert({
    where: {
      attemptId,
    },
    create: {
      attemptId,
      evaluatorType: evaluator.type,
      status: "EVALUATING",
    },
    update: {
      evaluatorType: evaluator.type,
      status: "EVALUATING",
      score: null,
      result: Prisma.JsonNull,
      error: null,
      completedAt: null,
    },
  });

  try {
    const result = await evaluator.evaluate(
      attempt.problem,
      attempt.submission
    );

    await prisma.evaluation.update({
      where: {
        attemptId,
      },
      data: {
        status: "COMPLETED",
        score: result.score,
        result: result as unknown as Prisma.InputJsonValue,
        error: null,
        completedAt: new Date(),
      },
    });

    await prisma.attempt.update({
      where: {
        id: attemptId,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return await prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        submission: true,
        evaluation: true,
        problem: true,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Evaluation failed";

    await prisma.evaluation.update({
      where: {
        attemptId,
      },
      data: {
        status: "FAILED",
        error: message,
        completedAt: null,
      },
    });

    await prisma.attempt.update({
      where: {
        id: attemptId,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
}