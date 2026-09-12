const API_URL = import.meta.env.VITE_API_URL;

// console.log("API URL:", import.meta.env.VITE_API_URL);

export async function getProblems() {
  const response = await fetch(`${API_URL}/problems`);

  if (!response.ok) {
    throw new Error("Failed to fetch problems");
  }

  return response.json();
}

export async function getProblem(id: string) {
  const response = await fetch(`${API_URL}/problems/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch problem");
  }

  return response.json();
}

export async function createAttempt(problemId: string) {
  const response = await fetch(`${API_URL}/attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create attempt");
  }

  return response.json();
}

export async function submitSolution(
  attemptId: string,
  content: object
) {
  const response = await fetch(
    `${API_URL}/submissions/${attemptId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit solution");
  }

  return response.json();
}

export async function getAttempt(attemptId: string) {
  const response = await fetch(
    `${API_URL}/attempts/${attemptId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attempt");
  }

  return response.json();
}

export async function getProblemAttempts(problemId: string) {
  const response = await fetch(
    `${API_URL}/attempts/problem/${problemId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attempts");
  }

  return response.json();
}

export async function compareAttempts(problemId: string) {
  const response = await fetch(
    `${API_URL}/attempts/problem/${problemId}/compare`
  );

  if (!response.ok) {
    throw new Error("Failed to compare attempts");
  }

  return response.json();
}

export async function retryEvaluation(attemptId: string) {
  const response = await fetch(
    `${API_URL}/evaluations/${attemptId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to retry evaluation");
  }

  return response.json();
}