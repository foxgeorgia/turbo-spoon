# turbo-spoon

## Project intent

Turbo Spoon is an experimental prototype that explores using an LLM as an
email monitoring assistant.

High-level goals:
- The backend ingests and summarizes emails (Gmail integration).
- The frontend is a simple web UI that displays LLM-generated summaries/posts.
- Think: journal / blog / timeline.

Architecture notes:
- Backend: Node + Express.
- Frontend: React.
- Frontend code should live under `/frontend`.
