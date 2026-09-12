import { prisma } from "../../database/prisma.js";
import { LLMEvaluator } from "../evaluation/llmEvaluator.js";
import { evaluateAttempt } from "../evaluation/evaluation.service.js";

export async function submitSolution(
  attemptId: string,
  content: unknown
) {
  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: {
        id: attemptId,
      },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.status !== "DRAFT") {
      throw new Error("Attempt already submitted");
    }

    const submission = await tx.submission.create({
      data: {
        attemptId,
        type: "TEXT",
        content: content as object,
      },
    });
    await tx.attempt.update({
      where: {
        id: attemptId,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return submission;
  });

  const evaluator = new LLMEvaluator();

  void evaluateAttempt(attemptId, evaluator).catch((error) => {
    console.error("Automatic evaluation failed:", error);
  });

  return result;
}