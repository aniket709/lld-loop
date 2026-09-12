import { AttemptStatus } from "@prisma/client";

export class Attempt {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    private status: AttemptStatus = AttemptStatus.DRAFT,
    public readonly createdAt: Date = new Date(),
    private submittedAt?: Date,
    private completedAt?: Date
  ) {}

  getStatus(): AttemptStatus {
    return this.status;
  }

  submit(): void {
    if (this.status !== AttemptStatus.DRAFT) {
      throw new Error("Only a draft attempt can be submitted");
    }

    this.status = AttemptStatus.SUBMITTED;
    this.submittedAt = new Date();
  }

  startEvaluation(): void {
    if (this.status !== AttemptStatus.SUBMITTED) {
      throw new Error("Only a submitted attempt can start evaluation");
    }

    this.status = AttemptStatus.EVALUATING;
  }

  completeEvaluation(): void {
    if (this.status !== AttemptStatus.EVALUATING) {
      throw new Error("Only an evaluating attempt can be completed");
    }

    this.status = AttemptStatus.COMPLETED;
    this.completedAt = new Date();
  }

  failEvaluation(): void {
    if (this.status !== AttemptStatus.EVALUATING) {
      throw new Error("Only an evaluating attempt can fail");
    }

    this.status = AttemptStatus.FAILED;
  }
}