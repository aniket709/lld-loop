import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  compareAttempts,
  getProblemAttempts,
} from "../services/api";

type Attempt = {
  id: string;
  status: string;
  createdAt: string;
  evaluation?: {
    score: number | null;
  } | null;
};

type Comparison = {
  firstScore: number;
  latestScore: number;
  improvement: number;
  biggestImprovement: {
    criterion: string;
    improvement: number;
  } | null;
  remainingWeakness: {
    criterion: string;
    score: number;
    maxScore: number;
  } | null;
  criteria: {
    name: string;
    previousScore: number;
    latestScore: number;
    improvement: number;
    maxScore: number;
  }[];
};

export default function History() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [comparison, setComparison] =
    useState<Comparison | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        if (!problemId) return;

        const attemptsResponse =
          await getProblemAttempts(problemId);

        setAttempts(attemptsResponse.data);

        const comparisonResponse =
          await compareAttempts(problemId);

        setComparison(
          comparisonResponse.comparison ?? null
        );
      } catch (error) {
        setError("Failed to load attempt history");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [problemId]);

  if (loading) {
    return (
      <main className="page">
        <div className="status-card card">
          <div className="spinner" />
          <h2>Loading your history...</h2>
          <p>
            Preparing your previous attempts and progress.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="status-card card">
          <div className="failed-icon">!</div>

          <h2>Unable to load history</h2>

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

  return (
    <main className="page">

      <div className="history-page">

        <div className="history-topbar">

          <button
            className="button button-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <span className="history-label">
            LLD PRACTICE
          </span>

        </div>

        <header className="history-header">

          <div>
            <span className="eyebrow">
              YOUR PROGRESS
            </span>

            <h1>Attempt History</h1>

            <p>
              Review your previous solutions and track
              how your LLD design skills improve over time.
            </p>
          </div>

          <div className="attempt-count">
            <strong>{attempts.length}</strong>
            <span>
              {attempts.length === 1
                ? "Attempt"
                : "Attempts"}
            </span>
          </div>

        </header>

        {comparison && (
          <section className="progress-section">

            <div className="section-heading history-heading">

              <div>
                <span className="eyebrow">
                  PERFORMANCE
                </span>

                <h2>Your progress</h2>

                <p>
                  Compare your first and latest completed
                  attempts.
                </p>
              </div>

            </div>

            <div className="comparison-grid">

              <div className="stat-card history-stat">

                <span>First Score</span>

                <strong>
                  {comparison.firstScore}
                  <small>/100</small>
                </strong>

                <p>
                  Your starting point
                </p>

              </div>

              <div className="stat-card history-stat">

                <span>Latest Score</span>

                <strong>
                  {comparison.latestScore}
                  <small>/100</small>
                </strong>

                <p>
                  Your latest result
                </p>

              </div>

              <div
                className={`stat-card history-stat ${
                  comparison.improvement >= 0
                    ? "positive-stat"
                    : "negative-stat"
                }`}
              >

                <span>Overall Change</span>

                <strong>
                  {comparison.improvement >= 0
                    ? "+"
                    : ""}
                  {comparison.improvement}
                </strong>

                <p>
                  Points since first attempt
                </p>

              </div>

            </div>

            <div className="progress-highlights">

              {comparison.biggestImprovement && (
                <div className="highlight-card improvement-highlight">

                  <div className="highlight-icon">
                    ↑
                  </div>

                  <div>
                    <span>
                      BIGGEST IMPROVEMENT
                    </span>

                    <strong>
                      {
                        comparison
                          .biggestImprovement
                          .criterion
                      }
                    </strong>

                    <p>
                      +
                      {
                        comparison
                          .biggestImprovement
                          .improvement
                      }{" "}
                      points
                    </p>
                  </div>

                </div>
              )}

              {comparison.remainingWeakness && (
                <div className="highlight-card weakness-highlight">

                  <div className="highlight-icon">
                    !
                  </div>

                  <div>
                    <span>
                      FOCUS AREA
                    </span>

                    <strong>
                      {
                        comparison
                          .remainingWeakness
                          .criterion
                      }
                    </strong>

                    <p>
                      {comparison.remainingWeakness.score}
                      /
                      {comparison.remainingWeakness.maxScore}
                    </p>
                  </div>

                </div>
              )}

            </div>

            <div className="criterion-progress-card card">

              <div className="progress-card-header">

                <div>
                  <h2>Criterion progress</h2>

                  <p>
                    See how each part of your LLD design
                    has changed.
                  </p>
                </div>

              </div>

              <div className="history-progress-list">

                {comparison.criteria.map(
                  (criterion) => {

                    const percentage =
                      (criterion.latestScore /
                        criterion.maxScore) *
                      100;

                    return (
                      <div
                        className="history-progress-row"
                        key={criterion.name}
                      >

                        <div className="history-progress-top">

                          <strong>
                            {criterion.name}
                          </strong>

                          <span>
                            {criterion.latestScore}/
                            {criterion.maxScore}
                          </span>

                        </div>

                        <div className="history-progress-bar">

                          <div
                            className="history-progress-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <div className="history-progress-bottom">

                          <span>
                            Previous:{" "}
                            {
                              criterion.previousScore
                            }
                            /
                            {criterion.maxScore}
                          </span>

                          <span
                            className={
                              criterion.improvement >= 0
                                ? "change-positive"
                                : "change-negative"
                            }
                          >
                            {criterion.improvement >= 0
                              ? "+"
                              : ""}
                            {criterion.improvement}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </section>
        )}

        <section className="attempts-section">

          <div className="section-heading history-heading">

            <div>
              <span className="eyebrow">
                HISTORY
              </span>

              <h2>Previous attempts</h2>

              <p>
                Open any completed attempt to review the
                feedback you received.
              </p>
            </div>

          </div>

          {attempts.length === 0 ? (

            <div className="empty-history card">

              <div className="empty-icon">
                ○
              </div>

              <h2>No attempts yet</h2>

              <p>
                Start solving this problem to create your
                first attempt.
              </p>

            </div>

          ) : (

            <div className="attempt-list">

              {attempts.map((attempt, index) => {

                const score =
                  attempt.evaluation?.score;

                const isCompleted =
                  attempt.status === "COMPLETED";

                const isFailed =
                  attempt.status === "FAILED";

                const isEvaluating =
                  attempt.status === "EVALUATING";

                return (
                  <div
                    className="attempt-history-card card"
                    key={attempt.id}
                  >

                    <div className="attempt-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="attempt-main">

                      <div className="attempt-main-top">

                        <div>
                          <h3>
                            Attempt {index + 1}
                          </h3>

                          <span className="attempt-date">
                            {new Date(
                              attempt.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>

                        <span
                          className={`attempt-status ${
                            isCompleted
                              ? "status-completed"
                              : isFailed
                              ? "status-failed"
                              : isEvaluating
                              ? "status-evaluating"
                              : "status-pending"
                          }`}
                        >
                          <span className="status-dot" />

                          {attempt.status}
                        </span>

                      </div>

                      <div className="attempt-divider" />

                      <div className="attempt-footer">

                        <div className="attempt-score">

                          <span>Score</span>

                          <strong>
                            {score ?? "—"}

                            {score !== null &&
                              score !==
                                undefined && (
                                <small>
                                  /100
                                </small>
                              )}
                          </strong>

                        </div>

                        {isCompleted ? (
                          <button
                            className="button button-secondary"
                            onClick={() =>
                              navigate(
                                `/attempt/${attempt.id}/feedback`
                              )
                            }
                          >
                            View Feedback →
                          </button>
                        ) : isFailed ? (
                          <button
                            className="button button-secondary"
                            onClick={() =>
                              navigate(
                                `/attempt/${attempt.id}/feedback`
                              )
                            }
                          >
                            View Status →
                          </button>
                        ) : (
                          <span className="attempt-processing">
                            Evaluation in progress
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        <div className="history-actions">

          <button
            className="button button-primary"
            onClick={() =>
              problemId &&
              navigate(`/problem/${problemId}`)
            }
          >
            Try Problem Again →
          </button>

        </div>

      </div>

    </main>
  );
}