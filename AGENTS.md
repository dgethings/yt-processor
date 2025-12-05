# AGENTS.md

## Build/Test Commands

- **Install dependencies**: `npm install`
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npx eslint .` (if eslint is added)
- **Format**: `npx prettier --write .` (if prettier is added)

## Code Style Guidelines

- **Language**: TypeScript/JavaScript (ES modules)
- **Package manager**: Use `npm` for dependency management
- **Imports**: Use ES6 import syntax
- **Type safety**: Use TypeScript interfaces and type annotations
- **Naming**: camelCase for functions and variables, PascalCase for classes/interfaces
- **Error handling**: Use try/catch blocks and throw descriptive errors
- **Environment variables**: Use `process.env.VAR_NAME` for configuration
- **Line length**: Follow common JavaScript conventions (100-120 characters)
- **Dependencies**: Add new dependencies to package.json

## Primary Instruction

Use the bd command-line tool for all new work, task planning, and issue tracking. Do not use markdown for planning or TODOs.

## Task Management Flow

- When you encounter a problem or a new task (e.g., 'fix broken tests'), file an issue immediately using bd create 'Description of the issue'.
- Before starting work, check for ready tasks with bd ready and claim the issue using bd update <issue-id> --status in_progress.
- After completing a task, close the issue with bd close <issue-id> 'Done'.
- If a task depends on another, use the dependency tracking feature to link them.

## Context Management

Use the beads system as your long-term memory to restore context and navigate historical tasks without loading everything into your current context window.

## Collaboration

If multiple agents or humans are working on the project, tell the agent to use the Agent Mail server for coordination to prevent conflicts: "Coordinate work with other agents using the Agent Mail system. Ensure you set the environment variables BEADS_AGENT_MAIL_URL, BEADS_AGENT_NAME, and BEADS_PROJECT_ID as per the documentation".

