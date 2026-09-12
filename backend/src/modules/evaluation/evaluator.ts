import { Problem, Submission } from "@prisma/client";

export type EvaluatorType = "RULE_BASED" | "LLM";

export interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestions: string[];
  criteria: {
    name: string;
    score: number;
    maxScore: number;
    evidence: string;
  }[];
}

export interface Evaluator {
  readonly type: EvaluatorType;

  evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult>;
}