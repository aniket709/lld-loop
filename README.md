# LLD Practice Platform

A simple platform for practicing Low-Level Design problems and getting structured feedback.

## Features

* Practice LLD problems
* Submit structured solutions
* AI-based design evaluation
* Rule-based validation
* Feedback with scores and evidence
* Retry failed evaluations
* Attempt history and comparison

## Tech Stack

* Frontend: React, TypeScript, Vite
* Backend: Node.js, Express, TypeScript
* Database: PostgreSQL, Prisma
* AI: Gemini API
* Docker: PostgreSQL

## How to Run

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Create `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/lld_practice"
PORT=5000
GEMINI_API_KEY="your_api_key"
GEMINI_MODEL="gemini-3.6-flash"
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Main Flow

```text
Choose Problem
      ↓
Create Attempt
      ↓
Submit Solution
      ↓
AI Evaluation
      ↓
Feedback
      ↓
Try Again / History
```

## Key Decisions

* Used a modular monolith instead of microservices.
* Saved submissions before starting evaluation.
* Used an Evaluator interface for different evaluation methods.
* Used both rule-based checks and LLM evaluation.
* Allowed multiple valid LLD solutions instead of comparing with one fixed design.

## Limitations

* No authentication in the MVP.
* Evaluation currently uses an external Gemini API.
* Evaluation runs asynchronously inside the backend process.
* Only structured text submissions are supported.

## Future Improvements

* Persistent evaluation queue
* Authentication
* Code and diagram submissions
* Human evaluation
* More LLD problems
