# Research Note — LLD Practice Platform

## 1. Introduction

Low-Level Design (LLD) is mainly about how we divide a software system into classes, interfaces, and responsibilities. It is not only about writing many classes. A good LLD should be easy to understand, easy to change, and easy to test.

While designing this platform, I focused on one simple learning cycle:

**Choose a problem → Think and design → Submit → Get feedback → Review → Try again**

The main goal is to help a learner improve their design instead of only giving them a score.

## 2. What should a learner submit?

A learner should not submit only a final score or a few lines of code. That does not give enough information to understand how they designed the system.

I decided to use a structured text submission with these sections:

* Assumptions
* Requirement understanding
* Classes and entities
* Responsibilities
* Relationships
* Interfaces and abstractions
* Design decisions
* Edge cases
* Code or pseudocode (optional) we will add this later.

This gives the evaluator enough information to understand the learner's thinking.

It also makes the submission easier to compare with future attempts.

---

## 3. How should an LLD solution be evaluated?

There is usually not only one correct answer in LLD.

For example, two developers may create different class structures for a Parking Lot system, but both designs can still be good.

Because of this, the evaluator should not simply compare the learner's answer with one fixed solution.

I decided to use a rubric with different areas:

| Area                        |   Marks |
| --------------------------- | ------: |
| Requirement understanding   |      15 |
| Responsibilities & cohesion |      20 |
| Encapsulation & abstraction |      15 |
| Coupling & relationships    |      15 |
| Extensibility               |      15 |
| Edge cases & testability    |      10 |
| Reasoning & trade-offs      |      10 |
| Total                        |      100 |

This makes the feedback more useful because the learner can see which part of their design is weak.

---

## 4. Deterministic checks vs AI evaluation

I found that using only an AI evaluator is not a good idea.

Some checks are simple and should be handled by normal application code.

For example:

* Does the problem exist?
* Does the attempt exist?
* Is a submission already made?
* Is the submission in the correct format?
* Is the attempt in the correct state?

These checks are deterministic, so they do not need AI.

AI is more useful for things that require judgment, such as:

* Are responsibilities properly divided?
* Is there too much coupling?
* Are abstractions useful?
* Is the design easy to extend?
* Are the design decisions reasonable?
* What can the learner improve?

So the platform uses both approaches.

**Rule-based evaluation handles fixed checks, while the LLM handles design feedback.**

---

## 5. Supporting different valid solutions

One important decision was not to force the learner to follow one reference architecture.

For example, a learner may use a Strategy pattern for parking spot selection. Another learner may use a different design that is also clean and extensible.

The evaluator should judge the result based on the responsibilities, relationships, trade-offs, and requirements.

The LLM prompt therefore tells the evaluator:

* Do not compare against one reference design.
* Do not reward a solution just because it has more classes.
* Do not penalize different class names.
* Do not add patterns only for the sake of using patterns.
* Look at the actual reasoning behind the design.

This makes the feedback more fair.

---

## 6. What happens when evaluation is slow or fails?

AI evaluation can take time and it can also fail because of network problems, API errors, or other issues.

The most important thing is that the learner's submission should not be lost.

The platform therefore saves the submission first.

The attempt then follows this state:

**Submitted → Evaluating → Completed / Failed**

If evaluation fails, the learner can retry the evaluation without submitting the same solution again.

This also avoids unnecessary duplicate submissions.

For the prototype, evaluation is started asynchronously inside the application. If the platform grows later, this part can be moved to a persistent job queue.

---

## 7. Extensibility

The evaluation system uses an `Evaluator` interface.

The current evaluators are:

* Rule-based evaluator
* LLM evaluator

Because the practice flow depends on the interface instead of a specific evaluator, more evaluators can be added later.

For example:

* Human evaluator
* Code evaluator
* Diagram evaluator

The same idea can be used for submission formats.

The current version uses structured text, but a future version could support class diagrams or code submissions without changing the main practice flow.

---

## 8. Main design decision

I decided to keep the application as a **modular monolith** for the prototype.

The main modules are:

* Problem
* Attempt
* Submission
* Evaluation

I did not use microservices because the current scale does not need them.

Using many services would make the project more difficult without giving much benefit at this stage.

If the number of users grows, the evaluation part would be the first component I would consider moving to a separate worker or queue system because AI evaluation can be slow.

---

## 9. Conclusion

The main idea of this platform is not just to give a learner a score.

It should help the learner understand:

**What did I do well? What was weak? How can I improve it?**

The combination of structured submissions, rule-based checks, LLM feedback, attempt history, and comparison between attempts gives the learner a complete practice loop.

The MVP keeps the system simple but leaves clear extension points for future evaluators, submission formats, and better evaluation infrastructure.
