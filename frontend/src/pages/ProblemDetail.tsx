import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAttempt, getProblem } from "../services/api";

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  requirements: string[];
};

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProblem() {
      try {
        if (!id) return;

        const response = await getProblem(id);
        setProblem(response.data);
      } catch (error) {
        setError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    }

    loadProblem();
  }, [id]);

  async function handleStart() {
    if (!problem) return;

    try {
      setStarting(true);

      const response = await createAttempt(problem.id);

      const attemptId = response.data.id;

      navigate(`/attempt/${attemptId}`);
    } catch (error) {
      setError("Failed to start attempt");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <p>Loading problem...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!problem) {
    return <p>Problem not found</p>;
  }

  return (
    <main className="page">
      <div className="problem-detail">
        <button
          className="button button-secondary back-link"
          onClick={() => navigate("/")}
        >
          ← Back to Problems
        </button>
  
        <span
          className={`badge ${problem.difficulty.toLowerCase()}`}
        >
          {problem.difficulty}
        </span>
  
        <h1>{problem.title}</h1>
  
        <p className="problem-description">
          {problem.description}
        </p>
  
        <div className="card requirements-card">
          <h2>Requirements</h2>
  
          <ul>
            {problem.requirements.map(
              (requirement, index) => (
                <li key={index}>{requirement}</li>
              )
            )}
          </ul>
        </div>
  
        <div className="action-card">
          <button
            className="button button-primary"
            onClick={handleStart}
            disabled={starting}
          >
            {starting
              ? "Starting..."
              : "Practice this problem →"}
          </button>
  
          <button
            className="button button-secondary"
            onClick={() =>
              navigate(
                `/problem/${problem.id}/history`
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