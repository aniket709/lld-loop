import { Problem, Submission } from "@prisma/client";
import {
  Evaluator,
  EvaluationResult,
} from "./evaluator";

export class RuleBasedEvaluator implements Evaluator {
    readonly type = "RULE_BASED" as const;
  async evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult> {
    const content = submission.content as Record<string, unknown>;

    const evidence = {
      hasAssumptions: this.hasMeaningfulArray(content.assumptions),
      hasClasses: this.hasMeaningfulArray(content.classes),
      hasResponsibilities: this.hasMeaningfulObject(
        content.responsibilities
      ),
      hasRelationships: this.hasMeaningfulArray(
        content.relationships
      ),
      hasInterfaces: this.hasMeaningfulArray(
        content.interfaces
      ),
      hasDesignDecisions: this.hasMeaningfulArray(
        content.designDecisions
      ),
      hasEdgeCases: this.hasMeaningfulArray(
        content.edgeCases
      ),
    };

    const criteria = [
      {
        name: "Requirement understanding",
        score: 0,
        maxScore: 15,
        evidence: evidence.hasAssumptions
          ? "The submission provides assumptions that can be evaluated against the problem requirements."
          : "No meaningful assumptions or requirement reasoning was provided.",
      },
      {
        name: "Responsibilities & cohesion",
        score: 0,
        maxScore: 20,
        evidence: evidence.hasResponsibilities
          ? "Class responsibilities have been provided and can be evaluated for cohesion and responsibility assignment."
          : "No meaningful class responsibilities were provided.",
      },
      {
        name: "Encapsulation & abstraction",
        score: 0,
        maxScore: 15,
        evidence: evidence.hasInterfaces
          ? "The submission identifies abstractions that can be evaluated for whether they are justified."
          : "No explicit abstractions were provided. This is not automatically a design flaw; the candidate should justify the choice where appropriate.",
      },
      {
        name: "Coupling & relationships",
        score: 0,
        maxScore: 15,
        evidence: evidence.hasRelationships
          ? "Relationships between design elements are provided and can be evaluated for coupling and ownership."
          : "Relationships between design elements are not clearly described.",
      },
      {
        name: "Extensibility",
        score: 0,
        maxScore: 15,
        evidence: evidence.hasDesignDecisions
          ? "Design decisions are provided and can be evaluated against likely future changes."
          : "No meaningful design decisions or extension reasoning was provided.",
      },
      {
        name: "Edge cases & testability",
        score: 0,
        maxScore: 10,
        evidence: evidence.hasEdgeCases
          ? "The submission identifies scenarios that can be evaluated for completeness and testability."
          : "No meaningful edge cases were provided.",
      },
      {
        name: "Reasoning & trade-offs",
        score: 0,
        maxScore: 10,
        evidence: evidence.hasDesignDecisions
          ? "Design decisions provide evidence that can be evaluated for reasoning and trade-offs."
          : "The submission does not provide enough reasoning to evaluate design trade-offs.",
      },
    ];

    return {
      score: 0,
      summary:
        "Deterministic validation completed. Design quality requires semantic evaluation.",
      strengths: [],
      concerns: [],
      suggestions: [],
      criteria,
    };
  }

  private hasMeaningfulArray(value: unknown): boolean {
    return (
      Array.isArray(value) &&
      value.some(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0
      )
    );
  }

  private hasMeaningfulObject(value: unknown): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return false;
    }

    return Object.entries(value).some(
      ([key, value]) =>
        key.trim().length > 0 &&
        typeof value === "string" &&
        value.trim().length > 0
    );
  }
}