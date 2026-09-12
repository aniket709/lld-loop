import { GoogleGenAI } from "@google/genai";
import { Problem, Submission } from "@prisma/client";
import {
  Evaluator,
  EvaluationResult,
} from "./evaluator";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export class LLMEvaluator implements Evaluator {
  readonly type = "LLM" as const;

  async evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult> {
    const prompt = this.buildPrompt(problem, submission);

    const response = await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-2.5-flash",

      contents: prompt,

      config: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    return this.parseResult(text);
  }

  private buildPrompt(
    problem: Problem,
    submission: Submission
  ): string {
    return `
You are an experienced Low-Level Design interviewer.

Evaluate the learner's LLD solution.

IMPORTANT RULES:

1. Multiple LLD architectures can be valid.
2. Do NOT compare against one reference architecture.
3. Do NOT reward a solution simply because it has more classes.
4. Do NOT reward unnecessary design patterns.
5. Do NOT penalize different but valid naming choices.
6. Evaluate responsibilities and cohesion.
7. Evaluate coupling and relationships.
8. Evaluate whether abstractions are justified.
9. Evaluate extensibility for likely future changes.
10. Evaluate edge cases and testability.
11. Evaluate reasoning and trade-offs.
12. Give evidence from the learner's submission.
13. Give constructive and specific feedback.
14. Final score must be between 0 and 100.

PROBLEM

Title:
${problem.title}

Description:
${problem.description}

Requirements:
${JSON.stringify(problem.requirements, null, 2)}

LEARNER SUBMISSION

${JSON.stringify(submission.content, null, 2)}

RUBRIC

Requirement understanding: 15 points

Responsibilities & cohesion: 20 points

Encapsulation & abstraction: 15 points

Coupling & relationships: 15 points

Extensibility: 15 points

Edge cases & testability: 10 points

Reasoning & trade-offs: 10 points

Return ONLY JSON with this exact structure:

{
  "score": 0,
  "summary": "overall assessment",
  "strengths": [
    "strength"
  ],
  "concerns": [
    "concern"
  ],
  "suggestions": [
    "suggestion"
  ],
  "criteria": [
    {
      "name": "Requirement understanding",
      "score": 0,
      "maxScore": 15,
      "evidence": "specific evidence"
    },
    {
      "name": "Responsibilities & cohesion",
      "score": 0,
      "maxScore": 20,
      "evidence": "specific evidence"
    },
    {
      "name": "Encapsulation & abstraction",
      "score": 0,
      "maxScore": 15,
      "evidence": "specific evidence"
    },
    {
      "name": "Coupling & relationships",
      "score": 0,
      "maxScore": 15,
      "evidence": "specific evidence"
    },
    {
      "name": "Extensibility",
      "score": 0,
      "maxScore": 15,
      "evidence": "specific evidence"
    },
    {
      "name": "Edge cases & testability",
      "score": 0,
      "maxScore": 10,
      "evidence": "specific evidence"
    },
    {
      "name": "Reasoning & trade-offs",
      "score": 0,
      "maxScore": 10,
      "evidence": "specific evidence"
    }
  ]
}
`;
  }

  private parseResult(
    text: string
  ): EvaluationResult {
    try {
      const result = JSON.parse(text);

      if (
        typeof result.score !== "number" ||
        !Array.isArray(result.criteria)
      ) {
        throw new Error(
          "Invalid evaluation structure"
        );
      }

      return result as EvaluationResult;
    } catch (error) {
      console.error(
        "Invalid Gemini response:",
        text
      );

      throw new Error(
        "Gemini returned invalid evaluation JSON"
      );
    }
  }
}