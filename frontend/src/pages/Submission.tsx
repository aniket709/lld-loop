import {useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttempt, submitSolution } from "../services/api";

type Attempt = {
  id: string;
  status: string;
  problem: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
  };
};

type FormData = {
  assumptions: string;
  requirements: string;
  classes: string;
  responsibilities: string;
  relationships: string;
  interfaces: string;
  designDecisions: string;
  edgeCases: string;
  code: string;
};

const initialForm: FormData = {
  assumptions: "",
  requirements: "",
  classes: "",
  responsibilities: "",
  relationships: "",
  interfaces: "",
  designDecisions: "",
  edgeCases: "",
  code: "",
};

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseResponsibilities(
  value: string
): Record<string, string> {
  const result: Record<string, string> = {};

  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        result[line] = "";
        return;
      }

      const className = line
        .slice(0, separatorIndex)
        .trim();

      const responsibility = line
        .slice(separatorIndex + 1)
        .trim();

      result[className] = responsibility;
    });

  return result;
}

export default function Submission() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const [form, setForm] =
    useState<FormData>(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAttempt() {
      try {
        if (!attemptId) return;

        const response = await getAttempt(attemptId);

        setAttempt(response.data);
      } catch (error) {
        setError("Failed to load attempt");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId]);

  function handleChange(
    field: keyof FormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!attemptId) return;

    try {
      setSubmitting(true);
      setError("");

      const content = {
        assumptions: linesToArray(form.assumptions),
        requirements: linesToArray(form.requirements),
        classes: linesToArray(form.classes),
        responsibilities: parseResponsibilities(
          form.responsibilities
        ),
        relationships: linesToArray(
          form.relationships
        ),
        interfaces: linesToArray(form.interfaces),
        designDecisions: linesToArray(
          form.designDecisions
        ),
        edgeCases: linesToArray(form.edgeCases),
        code: form.code,
      };

      await submitSolution(attemptId, content);

      navigate(`/attempt/${attemptId}/feedback`);
    } catch (error) {
      setError("Failed to submit solution");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="status-card card">
          <div className="spinner" />
          <h2>Loading your workspace...</h2>
          <p>
            Preparing the problem and submission form.
          </p>
        </div>
      </main>
    );
  }

  if (error && !attempt) {
    return (
      <main className="page">
        <div className="status-card card">
          <h2>Something went wrong</h2>
          <p className="error">{error}</p>

          <button
            className="button button-secondary"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className="page">
        <div className="status-card card">
          <h2>Attempt not found</h2>

          <button
            className="button button-secondary"
            onClick={() => navigate("/")}
          >
            Back to Problems
          </button>
        </div>
      </main>
    );
  }

  if (submitting) {
    return (
      <main className="page">
        <div className="validation-page">
          <div className="validation-card card">

            <div className="validation-icon">
              <div className="spinner" />
            </div>

            <span className="eyebrow">
              LLD PRACTICE
            </span>

            <h1>Validating your solution</h1>

            <p className="validation-description">
              Your design is being saved and prepared
              for evaluation. Please wait a moment.
            </p>

            <div className="status-steps">

              <div className="status-step active">
                <div className="step-circle">
                  ✓
                </div>

                <div>
                  <strong>Solution submitted</strong>
                  <span>
                    Your answer is being sent securely.
                  </span>
                </div>
              </div>

              <div className="status-line active-line" />

              <div className="status-step active">
                <div className="step-circle loading-circle">
                  <span />
                </div>

                <div>
                  <strong>Validating</strong>
                  <span>
                    Checking your submission.
                  </span>
                </div>
              </div>

              <div className="status-line" />

              <div className="status-step">
                <div className="step-circle">
                  3
                </div>

                <div>
                  <strong>AI evaluation</strong>
                  <span>
                    Your LLD design will be reviewed.
                  </span>
                </div>
              </div>

            </div>

            <div className="validation-progress">
              <div className="validation-progress-bar" />
            </div>

            <p className="validation-note">
              Your submission is saved before evaluation
              begins.
            </p>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="submission-page">

        <div className="submission-header">

          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="submission-title">
            <span className="eyebrow">
              LLD PRACTICE
            </span>

            <h1>{attempt.problem.title}</h1>

            <p>
              Design your solution carefully and explain
              the reasoning behind your architecture.
            </p>
          </div>

        </div>

        <section className="card problem-context">

          <div className="section-label">
            Problem
          </div>

          <h2>{attempt.problem.title}</h2>

          <p>{attempt.problem.description}</p>

          <div className="requirements-heading">
            Requirements
          </div>

          <ul>
            {attempt.problem.requirements.map(
              (requirement, index) => (
                <li key={index}>{requirement}</li>
              )
            )}
          </ul>

        </section>

        <form
          className="submission-form"
          onSubmit={handleSubmit}
        >

          <section className="form-section">
            <div className="form-number">01</div>

            <div className="form-content">
              <h3>Assumptions</h3>

              <p>
                What assumptions are you making about
                the system?
              </p>

              <textarea
                value={form.assumptions}
                onChange={(event) =>
                  handleChange(
                    "assumptions",
                    event.target.value
                  )
                }
                placeholder={`Example:
The system supports multiple floors
Each vehicle has a unique ID
A parking spot can hold only one vehicle`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">02</div>

            <div className="form-content">
              <h3>Requirement Understanding</h3>

              <p>
                Explain the requirements you understand
                from the problem. One requirement per line.
              </p>

              <textarea
                value={form.requirements}
                onChange={(event) =>
                  handleChange(
                    "requirements",
                    event.target.value
                  )
                }
                placeholder={`Example:
The system should support multiple vehicle types
The system should assign an appropriate parking spot
The system should release the spot when a vehicle exits`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">03</div>

            <div className="form-content">
              <h3>Classes & Entities</h3>

              <p>
                List the important classes or entities.
                One class per line.
              </p>

              <textarea
                value={form.classes}
                onChange={(event) =>
                  handleChange(
                    "classes",
                    event.target.value
                  )
                }
                placeholder={`Example:
ParkingLot
ParkingFloor
ParkingSpot
Vehicle
Ticket
PricingStrategy`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">04</div>

            <div className="form-content">
              <h3>Responsibilities</h3>

              <p>
                Define what each class is responsible for.
                Use{" "}
                <strong>
                  ClassName: responsibility
                </strong>
              </p>

              <textarea
                value={form.responsibilities}
                onChange={(event) =>
                  handleChange(
                    "responsibilities",
                    event.target.value
                  )
                }
                placeholder={`Example:
ParkingLot: coordinates parking operations
ParkingFloor: manages parking spots on a floor
ParkingSpot: stores the currently parked vehicle
Ticket: stores entry and exit information`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">05</div>

            <div className="form-content">
              <h3>Relationships</h3>

              <p>
                Explain how your classes interact with
                each other.
              </p>

              <textarea
                value={form.relationships}
                onChange={(event) =>
                  handleChange(
                    "relationships",
                    event.target.value
                  )
                }
                placeholder={`Example:
ParkingLot has multiple ParkingFloors
ParkingFloor contains multiple ParkingSpots
Ticket is associated with a Vehicle
ParkingLot uses PricingStrategy`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">06</div>

            <div className="form-content">
              <h3>Interfaces & Abstractions</h3>

              <p>
                List important interfaces or abstractions
                and explain where they are useful.
              </p>

              <textarea
                value={form.interfaces}
                onChange={(event) =>
                  handleChange(
                    "interfaces",
                    event.target.value
                  )
                }
                placeholder={`Example:
SpotAssignmentStrategy
PricingStrategy
PaymentProcessor`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">07</div>

            <div className="form-content">
              <h3>Design Decisions & Patterns</h3>

              <p>
                Explain important design decisions,
                patterns, and the reason behind them.
              </p>

              <textarea
                value={form.designDecisions}
                onChange={(event) =>
                  handleChange(
                    "designDecisions",
                    event.target.value
                  )
                }
                placeholder={`Example:
Use Strategy pattern for parking spot assignment
so new strategies can be added without modifying
the ParkingLot class.`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">08</div>

            <div className="form-content">
              <h3>Edge Cases</h3>

              <p>
                Think about failures, invalid input,
                and unusual scenarios.
              </p>

              <textarea
                value={form.edgeCases}
                onChange={(event) =>
                  handleChange(
                    "edgeCases",
                    event.target.value
                  )
                }
                placeholder={`Example:
No parking spot is available
Invalid vehicle type
Vehicle exits without a valid ticket
Two vehicles try to occupy the same spot`}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-number">09</div>

            <div className="form-content">
              <h3>Code / Pseudocode</h3>

              <p>
                Optional. Add important classes,
                interfaces, or pseudocode.
              </p>

              <textarea
                className="code-input"
                value={form.code}
                onChange={(event) =>
                  handleChange(
                    "code",
                    event.target.value
                  )
                }
                placeholder={`interface PricingStrategy {
  calculatePrice(ticket: Ticket): number;
}

class ParkingLot {
  parkVehicle(vehicle: Vehicle) {
    // implementation
  }
}`}
              />
            </div>
          </section>

          
          <div className="submit-area">

            {error && (
              <div className="submit-error">
                {error}
              </div>
            )}

            <div className="submit-card">

              <div>
                <strong>
                  Ready to submit?
                </strong>

                <p>
                  Your solution will be saved before
                  evaluation begins.
                </p>
              </div>

              <button
                className="button button-primary submit-button"
                type="submit"
                disabled={submitting}
              >
                Submit Solution →
              </button>

            </div>

          </div>

        </form>
      </div>
    </main>
  );
}