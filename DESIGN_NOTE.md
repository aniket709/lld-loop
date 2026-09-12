# Design Note — LLD Practice Platform

## 1. Overview

The platform allows users to practice LLD problems, submit their designs, get feedback, and try again.

Main flow:

Choose Problem → Submit Solution → Evaluate → Feedback → History → Try Again

The project is built as a modular monolith with four main modules:

* Problem
* Attempt
* Submission
* Evaluation

## 2. Domain Design

A Problem can have many Attempts.

Each Attempt has one Submission and one Evaluation.

```text
Problem
   |
   |--- many Attempts
             |
             |--- Submission
             |
             |--- Evaluation
```

An Attempt also has a status:

```text
DRAFT → SUBMITTED → EVALUATING → COMPLETED
                              ↘ FAILED
```

If evaluation fails, the same attempt can be evaluated again.

## 3. Submission Design

The learner submits a structured LLD solution containing:

* Requirements
* Classes
* Responsibilities
* Relationships
* Interfaces
* Design decisions
* Edge cases
* Optional code or pseudocode

The submission is saved before evaluation starts. This makes sure the learner's work is not lost if evaluation fails.

## 4. Evaluation Design

The system uses an `Evaluator` interface.

```text
Evaluator
   |
   |--- RuleBasedEvaluator
   |
   |--- LLMEvaluator
```

Rule-based checks handle things that can be checked directly, such as valid attempts and submission state.

The LLM evaluates design quality such as responsibilities, coupling, abstraction, extensibility, and trade-offs.

The evaluator does not expect one fixed correct architecture because LLD can have multiple valid solutions.

## 5. Evaluation Flow

When a learner submits:

```text
Save Submission
      ↓
SUBMITTED
      ↓
EVALUATING
      ↓
Evaluator
      ↓
COMPLETED / FAILED
```

Evaluation is started asynchronously so the submission request does not have to wait for the complete AI response.

If evaluation fails, the learner can retry the evaluation without submitting again.

## 6. Why This Design?

I chose a modular monolith because the project is small and does not need microservices.

The `Evaluator` interface makes it possible to add other evaluators later, such as a human, code, or diagram evaluator.

The main goal was to keep the system simple while making the important parts easy to change.
