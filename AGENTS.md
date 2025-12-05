# AGENTS.md - Agent Workflow & Development Guidelines

**CRITICAL: This file contains essential instructions for OpenCode agents working on this project.**

You will use the `bd` command-line tool for all work tracking, task management, and issue discovery. This ensures work is centralized, dependencies are tracked, and context persists across agent sessions.

---

## 🤖 Agent Workflow - Your Task Management System

This section explains how you should work on this project. Follow these steps in order for each task.

### What is `bd` and Why Use It?

`bd` is a **dependency-aware issue tracker** that:
- **Centralizes all work** in `.beads/beads.db` (the local database)
- **Tracks dependencies** to prevent duplicate effort
- **Persists context** across agent sessions using the beads system
- **Enables coordination** between multiple agents working in parallel

**Documentation:** https://github.com/steveyegge/beads

The `.beads/` directory contains:
- `beads.db` - Your work database
- `issues.jsonl` - Git-synced work items
- `config.yaml` - Project configuration
- `.local_version` - Version tracking

### Step 1: Check Ready Work

**When:** At the start of each work session or after completing a task.

**Command:**
```bash
bd ready
```

**Purpose:** Shows issues that are ready to claim (open status + no blocking dependencies).

**What to do:**
- If there are ready issues, pick one with the highest priority
- Look for Priority 0 (critical) work first
- If no ready issues, check `bd list --status open` to see all open work

---

### Step 2: Claim an Issue

**When:** You've selected work from `bd ready`.

**Command:**
```bash
bd update yt-1 --status in_progress
```

**Purpose:** Marks the issue as claimed so other agents know you're working on it.

**Why:** Prevents duplicate effort and shows clear ownership of work.

---

### Step 3: Track Your Work Session

**When:** You're starting significant work (especially multi-step tasks or bug fixes).

**Command:**
```bash
bd create "Session: <your task description>" --status in_progress
```

**Example:**
```bash
bd create "Session: Fix critical issues from review" --status in_progress
```

**Purpose:** Creates a session issue that becomes your work container and context anchor.

**Why This Matters:**
- If you're interrupted, you can restore context by showing the session issue
- All issues discovered during this session can be linked to the session
- Future agents can see what you were working on and why
- Your context isn't lost when the tool terminates

**Output:** You'll get a session issue ID like `yt-47`

---

### Step 4: Discover and File New Issues

**When:** You find bugs, missing features, incomplete implementations, or documentation gaps.

**Command:**
```bash
bd create "<issue title>" -p <priority> -d "<description>"
```

**Examples:**
```bash
bd create "Add missing build scripts" -p 0 -d "No build/dev/test scripts defined in package.json"

bd create "Protect JSON.parse calls" -p 0 -d "Unprotected JSON.parse can crash on malformed data"

bd create "Enable strict TypeScript settings" -p 1 -d "TypeScript config has relaxed settings reducing safety"

bd create "Extract duplicate utility function" -p 2 -d "Common function duplicated across multiple files"
```

**Important:**
- File issues **immediately** when you discover them
- Don't use markdown files or code comments for tracking
- Include line numbers and file references for bugs
- Use the priority mapping below

---

### Step 5: Link Dependencies

**When:** A new issue depends on or relates to existing issues.

**Command:**
```bash
bd dep add yt-new-id yt-blocking-id
```

**Example:**
If `yt-1` (npm scripts) must be done before `yt-3` (run tests):
```bash
bd dep add yt-3 yt-1
```

**Purpose:** Prevents agents from attempting blocked work.

**Visualize dependencies:**
```bash
bd dep tree yt-3
```

This shows all issues that must be completed before yt-3 is ready.

---

### Step 6: Link to Your Session

**When:** You discover a new issue while working on a session.

**Command:**
```bash
bd dep add yt-new-id yt-session-id
```

**Example:**
If you're in session `yt-47` and discover issue `yt-50`:
```bash
bd dep add yt-50 yt-47
```

**Purpose:** Shows that this issue was discovered during that session, maintaining work context.

---

### Step 7: Update Status As You Work

**When:** Your work progresses through different stages.

**Command:**
```bash
bd update yt-1 --status in_progress
bd update yt-1 --status open  # If blocked, reopen it
```

**Status values:** `open`, `in_progress`, `blocked`, `closed`

---

### Step 8: Complete Your Work

**When:** An issue is fixed, implemented, or documented.

**Command:**
```bash
bd close yt-1
bd close yt-1 yt-2 yt-3  # Close multiple at once
```

**Purpose:** Marks task complete and removes it from the work queue.

---

### Step 9: Close Your Session

**When:** You're done with your work session and want to wrap up.

**Command:**
```bash
bd close yt-47  # Where yt-47 is your session issue
```

**Purpose:** Marks the session complete. The session issue ID now serves as a historical reference for what was accomplished.

---

### Restoring Context Between Sessions

**Problem:** Agent work sessions may be interrupted. How do you restore context?

**Solution:** Use session issues as context anchors.

**On Next Run:**
```bash
bd show yt-47  # Shows your previous session
bd show yt-50  # Shows issue you discovered
bd show yt-51  # Shows related work
```

**Benefits:**
- ✅ No context loss across agent restarts
- ✅ Full history preserved in beads database
- ✅ Other agents can see what you were doing
- ✅ Dependencies prevent duplicate work
- ✅ Automatic git sync preserves everything

---

## Priority & Severity Mapping

Use this mapping when filing issues to assign the correct priority:

| Severity | Priority | bd Flag | Examples | When to Use |
|----------|----------|---------|----------|------------|
| **CRITICAL** | 0 | `-p 0` | Crashes, test failures, broken builds, security issues | Bug prevents functionality or blocks all other work |
| **IMPORTANT** | 1 | `-p 1` | Type safety, validation, missing error handling | Risk of future failures or must fix before release |
| **MEDIUM** | 2 | `-p 2` | Code duplication, edge cases, docs gaps | Technical debt or maintenance needs |
| **LOW** | 3 | `-p 3` | Polish, version updates, optional features | Enhancement without blocking value |



---

## Handling Discoveries

### When You Discover Issues

**Immediately file issues using bd create.** Don't use:
- ❌ Markdown files for tracking
- ❌ Code comments with TODO
- ❌ Text files
- ❌ Verbal notes

**Why:** Keeps work tracking centralized and actionable in bd.

---

## Quick BD Command Reference

Fast lookup for common agent operations:

### Viewing Work

```bash
bd ready                    # Show ready issues to claim (FIRST THING AGENTS RUN)
bd list                     # Show all issues
bd list --status open       # Show open issues only
bd list --priority 0        # Show critical priority work
bd show yt-1                # Show details of specific issue
bd show yt-47               # Restore context from previous session
```

### Claiming & Tracking Work

```bash
bd update yt-1 --status in_progress     # Claim an issue
bd create "Session: <desc>" --status in_progress  # Start work session
bd show yt-session-1                    # Restore previous session context
```

### Discovering Issues

```bash
bd create "Issue title" -p 0 -d "Detailed description"  # File critical issue
bd create "Issue title" -p 1 -d "Detailed description"  # File important issue
bd create "Issue title" -p 2 -d "Detailed description"  # File medium issue
bd create "Issue title" -p 3 -d "Detailed description"  # File low priority issue
```

### Managing Dependencies

```bash
bd dep add yt-2 yt-1        # Mark yt-1 as blocking yt-2
bd dep tree yt-2            # View all dependencies for yt-2
bd dep cycles               # Detect circular dependencies
```

### Completing Work

```bash
bd close yt-1                    # Mark single issue complete
bd close yt-1 yt-2 yt-3          # Close multiple issues at once
```

### Database Information

```bash
# Database location: .beads/beads.db
# Git-synced to: .beads/issues.jsonl
# Full documentation: https://github.com/steveyegge/beads
```

---

## Context Management with Beads

### What is Beads?

**Beads** is the long-term memory system that persists across agent sessions:
- Stores all work in `.beads/` directory
- Automatically syncs to git (`issues.jsonl`)
- Enables context restoration between interruptions
- Maintains complete history of all work

### How Agents Use Beads

1. **File issues** with `bd create` for work you discover
2. **Create session issues** at start of significant work
3. **Update status** as you make progress
4. **Reference previous sessions** to restore context

### Recommended Session Pattern

#### Start Your Session
```bash
bd create "Session: Fix critical issues from review" --status in_progress
# Output: yt-47: Session: Fix critical issues from review
```

#### Do Your Work
- Make code edits
- File new issues as you discover them: `bd create "New issue" -p <priority>`
- Link them to session: `bd dep add yt-new yt-47`
- Update issue status: `bd update yt-1 --status in_progress`
- Close completed work: `bd close yt-1`

#### End Your Session
```bash
bd close yt-47  # Session issue now serves as historical reference
```

#### Restore Previous Context (On Next Run)
```bash
bd show yt-47           # What was I doing?
bd show yt-50           # Issues I discovered
bd show yt-51           # Related work
bd list --assignee me   # My work items
```

### Why This Matters for Agents

- ✅ **Interruptions don't lose context** - Session issues restore work state
- ✅ **No duplicate effort** - Dependencies prevent overlapping work
- ✅ **Full audit trail** - Every discovery, status change, and completion is tracked
- ✅ **Other agents see your work** - Enables coordination without real-time communication
- ✅ **Automatic git sync** - Work persists in version control



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
- **File organization**: Extract shared utilities to avoid duplication
- **Input validation**: Validate all user inputs, don't assume data structure

---

## Collaboration & Agent Coordination

### Using `bd` for Multi-Agent Coordination

When multiple agents work on this project:

1. **Check ready work:** `bd ready` shows unblocked tasks
2. **Use dependencies:** Link issues to prevent duplicate effort
3. **Claim work:** Update status to `in_progress` to show ownership
4. **Assign work:** `bd update yt-1 --assignee agent-name` (if needed)

**Best practice:** Dependencies prevent most coordination issues without real-time communication.

### Using Agent Mail for Complex Coordination

If multiple agents need real-time coordination:

```bash
# Set these environment variables:
export BEADS_AGENT_MAIL_URL="<your-url>"
export BEADS_AGENT_NAME="<agent-name>"
export BEADS_PROJECT_ID="<project-id>"
```

**Reference:** Agent Mail documentation for setup details

**When to use:** Only for blocking coordination needs. Use `bd` dependencies first.

---

## Summary

**You are now ready to work on this project using `bd`:**

1. ✅ Read this document
2. ✅ Run `bd ready` to see available work
3. ✅ Claim issues with `bd update <issue-id> --status in_progress`
4. ✅ Create session issues for context tracking
5. ✅ File issues immediately when discovered
6. ✅ Link dependencies to prevent duplicate work
7. ✅ Close completed work with `bd close`
8. ✅ Restore context between sessions using session issues

**Database location:** `.beads/beads.db`  
**Documentation:** https://github.com/steveyegge/beads  

Good luck! 🚀
