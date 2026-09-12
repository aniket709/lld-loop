import { prisma } from "../../database/prisma";

export async function createAttempt(problemId: string) {
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    throw new Error("Problem not found");
  }

  return prisma.attempt.create({
    data: {
      problemId,
      status: "DRAFT",
    },
    include: {
      problem: true,
    },
  });
}

export async function getAttemptById(id: string) {
  return prisma.attempt.findUnique({
    where: {
      id,
    },
    include: {
      problem: true,
      submission: true,
      evaluation: true,
    },
  });
}
export async function getAttemptsByProblem(problemId: string) {
  return prisma.attempt.findMany({
    where: {
      problemId,
    },
    include: {
      submission: true,
      evaluation: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function compareAttempts(problemId: string) {
  const attempts = await prisma.attempt.findMany({
    where: {
      problemId,
      status: "COMPLETED",
      evaluation: {
        isNot: null,
      },
    },
    include: {
      evaluation: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (attempts.length < 2) {
    return {
      attempts,
      comparison: null,
      message: "At least two completed attempts are required for comparison",
    };
  }

  const firstAttempt = attempts[0];
  const latestAttempt = attempts[attempts.length - 1];

  const firstScore = firstAttempt.evaluation?.score ?? 0;
  const latestScore = latestAttempt.evaluation?.score ?? 0;

  const improvement = latestScore - firstScore;

  const firstResult = firstAttempt.evaluation?.result as {
    criteria?: {
      name: string;
      score: number;
      maxScore: number;
      evidence: string;
    }[];
  } | null;

  const latestResult = latestAttempt.evaluation?.result as {
    criteria?: {
      name: string;
      score: number;
      maxScore: number;
      evidence: string;
    }[];
  } | null;

  const firstCriteria = firstResult?.criteria ?? [];
  const latestCriteria = latestResult?.criteria ?? [];

  const criterionComparison = latestCriteria.map((latestCriterion) => {
    const previousCriterion = firstCriteria.find(
      (criterion) => criterion.name === latestCriterion.name
    );

    return {
      name: latestCriterion.name,
      previousScore: previousCriterion?.score ?? 0,
      latestScore: latestCriterion.score,
      improvement:
        latestCriterion.score - (previousCriterion?.score ?? 0),
      maxScore: latestCriterion.maxScore,
    };
  });

  const biggestImprovement = [...criterionComparison].sort(
    (a, b) => b.improvement - a.improvement
  )[0];

  const remainingWeakness = [...criterionComparison].sort(
    (a, b) =>
      a.latestScore / a.maxScore -
      b.latestScore / b.maxScore
  )[0];

  return {
    attempts: attempts.map((attempt) => ({
      id: attempt.id,
      score: attempt.evaluation?.score,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    })),

    comparison: {
      firstScore,
      latestScore,
      improvement,

      biggestImprovement: biggestImprovement
        ? {
            criterion: biggestImprovement.name,
            improvement: biggestImprovement.improvement,
          }
        : null,

      remainingWeakness: remainingWeakness
        ? {
            criterion: remainingWeakness.name,
            score: remainingWeakness.latestScore,
            maxScore: remainingWeakness.maxScore,
          }
        : null,

      criteria: criterionComparison,
    },
  };
}