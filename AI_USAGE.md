# AI Usage

I used AI during development mainly for guidance, debugging, and improving the implementation.

## Where AI Was Used

* Discussing the overall project architecture
* Designing the database models
* Planning the evaluation flow
* Designing the Evaluator interface
* Debugging TypeScript, Prisma, and React issues
* Improving frontend UI
* Writing and improving documentation
* Creating the LLM evaluation prompt

## LLM Evaluation

The application uses Gemini to evaluate LLD submissions.

The prompt asks the model to:

* Understand the problem requirements
* Review responsibilities and relationships
* Check abstraction and coupling
* Check extensibility and edge cases
* Give evidence from the submission
* Provide strengths, concerns, and suggestions
* Support multiple valid solutions

The application expects structured JSON from the model and stores the evaluation result.

## My Role

AI was used as a development assistant, but I made the final decisions about:

* Project scope
* Domain model
* Attempt lifecycle
* Evaluation architecture
* Database design
* MVP features
* Trade-offs and limitations

I also tested the complete application flow and verified the AI evaluation with a real submission.
