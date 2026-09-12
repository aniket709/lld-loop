import { prisma } from "../../database/prisma";

export async function getAllProblems() {
  return prisma.problem.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getProblemById(id: string) {
  return prisma.problem.findUnique({
    where: {
      id,
    },
  });
}