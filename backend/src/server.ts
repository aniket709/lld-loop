import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import attemptRoutes from "./modules/attempts/attempt.routes";
import problemRoutes from "./modules/problems/problem.routes";
import submissionRoutes from "./modules/submissions/submission.routes";
import evaluationRoutes from "./modules/evaluation/evaluation.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/attempts", attemptRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "LLD Practice Platform API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

