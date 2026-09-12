import { BrowserRouter, Routes, Route } from "react-router-dom";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Submission from "./pages/Submission";
import Feedback from "./pages/Feedback";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Problems />} />

        <Route
          path="/problem/:id"
          element={<ProblemDetail />}
        />
        <Route
  path="/attempt/:attemptId"
  element={<Submission />}
/>
<Route
    path="/attempt/:attemptId/feedback"
    element={<Feedback />}
  />
  <Route
  path="/problem/:problemId/history"
  element={<History />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;