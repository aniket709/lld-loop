import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttempt,
  retryEvaluation,
} from "../services/api";

type Criterion = {
  name: string;
  score: number;
  maxScore: number;
  evidence: string;
};

type EvaluationResult = {
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestions: string[];
  criteria: Criterion[];
};

type Attempt = {
  id: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "EVALUATING"
    | "COMPLETED"
    | "FAILED";

  problem: {
    id: string;
    title: string;
    description: string;
  };

  evaluation?: {
    status: string;
    score: number | null;
    result: EvaluationResult | null;
    error: string | null;
  } | null;
};

export default function Feedback() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] =
    useState<Attempt | null>(null);

  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attemptId) return;

    let intervalId: ReturnType<typeof setInterval>;

    async function loadAttempt() {
      try {
        const response = await getAttempt(attemptId);

        const currentAttempt =
          response.data as Attempt;

        setAttempt(currentAttempt);
        setLoading(false);

        if (
          currentAttempt.status === "COMPLETED" ||
          currentAttempt.status === "FAILED"
        ) {
          clearInterval(intervalId);
        }
      } catch (error) {
        setError("Failed to load evaluation");
        setLoading(false);
      }
    }

    loadAttempt();

    intervalId = setInterval(loadAttempt, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [attemptId]);

  async function handleRetry() {
    if (!attemptId) return;

    try {
      setRetrying(true);
      setError("");

      await retryEvaluation(attemptId);

      const response = await getAttempt(attemptId);

      setAttempt(response.data);
    } catch (error) {
      setError("Failed to retry evaluation");
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="status-card card">
          <div className="spinner" />
          <h2>Loading evaluation...</h2>
          <p>
            Preparing your feedback dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (error && !attempt) {
    return (
      <main className="page">
        <div className="status-card card">
          <h2>Unable to load feedback</h2>
          <p className="error">{error}</p>

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

  /*
   * SUBMITTED
   */
  if (attempt.status === "SUBMITTED") {
    return (
      <main className="page">
        <div className="evaluation-status-page">

          <div className="evaluation-status-card card">

            <div className="status-icon">
              ✓
            </div>

            <span className="eyebrow">
              SUBMISSION RECEIVED
            </span>

            <h1>Solution submitted</h1>

            <p>
              Your solution has been saved successfully.
              We're preparing it for evaluation.
            </p>

            <StatusTimeline current="submitted" />

            <div className="evaluation-loading">
              <div className="spinner" />

              <span>
                Preparing evaluation...
              </span>
            </div>

          </div>

        </div>
      </main>
    );
  }

  if (attempt.status === "EVALUATING") {
    return (
      <main className="page">
        <div className="evaluation-status-page">

          <div className="evaluation-status-card card">

            <div className="status-icon evaluating-icon">
              <div className="spinner" />
            </div>

            <span className="eyebrow">
              AI EVALUATION
            </span>

            <h1>Reviewing your design</h1>

            <p>
              Our evaluator is analyzing your LLD solution
              against the requirements and design rubric.
            </p>

            <StatusTimeline current="evaluating" />

            <div className="evaluation-info">

              <div className="info-item">
                <span>Problem</span>
                <strong>
                  {attempt.problem.title}
                </strong>
              </div>

              <div className="info-item">
                <span>Status</span>
                <strong>Evaluating</strong>
              </div>

            </div>

            <p className="polling-message">
              This page updates automatically when your
              feedback is ready.
            </p>

          </div>

        </div>
      </main>
    );
  }

  /*
   * FAILED
   */
  if (attempt.status === "FAILED") {
    return (
      <main className="page">
        <div className="evaluation-status-page">

          <div className="evaluation-status-card card">

            <div className="failed-icon">
              !
            </div>

            <span className="eyebrow failed-label">
              EVALUATION FAILED
            </span>

            <h1>We couldn't complete the evaluation</h1>

            <p>
              Your submission is still safely saved.
              You don't need to submit your solution again.
            </p>

            {attempt.evaluation?.error && (
              <div className="error-box">
                <strong>Error details</strong>
                <p>
                  {attempt.evaluation.error}
                </p>
              </div>
            )}

            {error && (
              <p className="error">{error}</p>
            )}

            <div className="button-row center-actions">

              <button
                className="button button-primary"
                onClick={handleRetry}
                disabled={retrying}
              >
                {retrying
                  ? "Retrying evaluation..."
                  : "Retry Evaluation"}
              </button>

              <button
                className="button button-secondary"
                onClick={() => navigate("/")}
              >
                Back to Problems
              </button>

            </div>

          </div>

        </div>
      </main>
    );
  }

  if (
    attempt.status === "COMPLETED" &&
    attempt.evaluation?.result
  ) {
    const result = attempt.evaluation.result;

    return (
      <main className="page">

        <div className="feedback-page">

          {/* TOP NAV */}
          <div className="feedback-topbar">

            <button
              className="button button-secondary"
              onClick={() => navigate("/")}
            >
              ← Problems
            </button>

            <span className="completed-pill">
              ✓ Evaluation Complete
            </span>

          </div>

          <div className="feedback-title">

            <span className="eyebrow">
              LLD EVALUATION
            </span>

            <h1>Feedback</h1>

            <p>
              {attempt.problem.title}
            </p>

          </div>

          <section className="score-hero card">

            <div className="score-main">

              <span className="score-label">
                Overall Score
              </span>

              <div className="score-value">
                {result.score}
                <span>/100</span>
              </div>

              <span className="score-caption">
                Based on your overall LLD design
              </span>

            </div>

            <div className="score-ring">

              <svg
                viewBox="0 0 120 120"
                className="score-svg"
              >
                <circle
                  className="score-ring-background"
                  cx="60"
                  cy="60"
                  r="50"
                />

                <circle
                  className="score-ring-progress"
                  cx="60"
                  cy="60"
                  r="50"
                  strokeDasharray="314"
                  strokeDashoffset={
                    314 -
                    (314 * result.score) / 100
                  }
                />
              </svg>

              <span>
                {result.score}%
              </span>

            </div>

          </section>

          <section className="feedback-section card">

            <div className="feedback-section-header">
              <div className="feedback-section-icon">
                ✦
              </div>

              <div>
                <h2>Overall assessment</h2>

                <p>
                  Here's what the evaluator thinks about
                  your solution.
                </p>
              </div>
            </div>

            <div className="summary-text">
              {result.summary}
            </div>

          </section>

          <section className="feedback-section">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  EVALUATION RUBRIC
                </span>

                <h2>Design breakdown</h2>

                <p>
                  See how your solution performed across
                  each LLD criterion.
                </p>
              </div>

            </div>

            <div className="criteria-grid">

              {result.criteria.map(
                (criterion, index) => {

                  const percentage =
                    (criterion.score /
                      criterion.maxScore) *
                    100;

                  return (
                    <div
                      className="criterion-card"
                      key={criterion.name}
                    >

                      <div className="criterion-top">

                        <div className="criterion-index">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="criterion-score">
                          {criterion.score}
                          <span>
                            /{criterion.maxScore}
                          </span>
                        </div>

                      </div>

                      <h3>
                        {criterion.name}
                      </h3>

                      <div className="criterion-bar">
                        <div
                          className="criterion-bar-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="evidence-box">
                        <span>Evidence</span>

                        <p>
                          {criterion.evidence}
                        </p>
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          <div className="feedback-columns">

            <section className="feedback-section card insight-card strength-card">

              <div className="insight-header">
                <div className="insight-icon">
                  ✓
                </div>

                <div>
                  <h2>What you did well</h2>
                  <p>
                    Strong parts of your design.
                  </p>
                </div>
              </div>

              <ul className="feedback-list">
                {result.strengths.map(
                  (strength, index) => (
                    <li key={index}>
                      {strength}
                    </li>
                  )
                )}
              </ul>

            </section>

            <section className="feedback-section card insight-card concern-card">

              <div className="insight-header">
                <div className="insight-icon">
                  !
                </div>

                <div>
                  <h2>Areas to improve</h2>
                  <p>
                    Things that could make your design
                    stronger.
                  </p>
                </div>
              </div>

              <ul className="feedback-list">
                {result.concerns.map(
                  (concern, index) => (
                    <li key={index}>
                      {concern}
                    </li>
                  )
                )}
              </ul>

            </section>

          </div>

          {/* SUGGESTIONS */}
          <section className="feedback-section card suggestions-card">

            <div className="feedback-section-header">

              <div className="feedback-section-icon">
                →
              </div>

              <div>
                <h2>How to improve</h2>

                <p>
                  Focus on these improvements in your
                  next attempt.
                </p>
              </div>

            </div>

            <div className="suggestion-list">

              {result.suggestions.map(
                (suggestion, index) => (
                  <div
                    className="suggestion-item"
                    key={index}
                  >
                    <div className="suggestion-number">
                      {index + 1}
                    </div>

                    <p>{suggestion}</p>
                  </div>
                )
              )}

            </div>

          </section>

          <div className="feedback-actions">

            <button
              className="button button-primary"
              onClick={() =>
                navigate(
                  `/problem/${attempt.problem.id}`
                )
              }
            >
              Try Again →
            </button>

            <button
              className="button button-secondary"
              onClick={() =>
                navigate(
                  `/problem/${attempt.problem.id}/history`
                )
              }
            >
              View Attempt History
            </button>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="page">
      <div className="status-card card">
        <h2>Unknown evaluation state</h2>
        <p>Please refresh the page.</p>
      </div>
    </main>
  );
}

function StatusTimeline({
  current,
}: {
  current: "submitted" | "evaluating";
}) {
  const evaluating =
    current === "evaluating";

  return (
    <div className="evaluation-timeline">

      <div className="timeline-item active">
        <div className="timeline-circle">
          ✓
        </div>

        <div>
          <strong>Submitted</strong>
          <span>
            Solution saved
          </span>
        </div>
      </div>

      <div
        className={`timeline-connector ${
          evaluating ? "active" : ""
        }`}
      />

      <div
        className={`timeline-item ${
          evaluating ? "active" : ""
        }`}
      >
        <div className="timeline-circle">
          {evaluating ? (
            <span className="mini-spinner" />
          ) : (
            "2"
          )}
        </div>

        <div>
          <strong>Evaluating</strong>
          <span>
            Reviewing your design
          </span>
        </div>
      </div>

      <div className="timeline-connector" />

      <div className="timeline-item">
        <div className="timeline-circle">
          3
        </div>

        <div>
          <strong>Feedback</strong>
          <span>
            Results ready
          </span>
        </div>
      </div>

    </div>
  );
}