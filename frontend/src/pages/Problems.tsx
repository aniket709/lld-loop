import { useEffect, useState } from "react";
import { getProblems } from "../services/api"
 import { useNavigate } from "react-router-dom";

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  

  useEffect(() => {
    async function loadProblems() {
      try {
        const response = await getProblems();
        setProblems(response.data);
      } catch (error) {
        setError("Failed to load problems");
      } finally {
        setLoading(false);
      }
    }

    loadProblems();
  }, []);

  if (loading) {
    return <p>Loading problems...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>LLD Practice</h1>
  
        <p>
          Practice low-level design problems, submit your
          designs, and get structured feedback on your
          architecture.
        </p>
      </header>
  
      <div className="problem-grid">
        {problems.map((problem) => (
          <div
            className="card problem-card"
            key={problem.id}
          >
            <span
              className={`badge ${problem.difficulty.toLowerCase()}`}
            >
              {problem.difficulty}
            </span>
  
            <h2>{problem.title}</h2>
  
            <p>{problem.description}</p>
  
            <button
              className="button button-primary"
              onClick={() =>
                navigate(`/problem/${problem.id}`)
              }
            >
              View Problem →
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}