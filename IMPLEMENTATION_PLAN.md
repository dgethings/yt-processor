# YouTube Processor Agent Implementation Plan

## Overview

This document outlines the complete implementation plan for creating a YouTube video processing agent system using the opencode framework. The system consists of a main orchestration agent and a summarization subagent that work together to process YouTube videos and generate Obsidian-formatted markdown files.

## Architecture

### Agent Flow
```
User Input (URL/ID + Comments + Output Location) 
→ youtube-processor agent 
→ youtube-transcript tool 
→ transcript-summarizer agent 
→ Obsidian markdown generation 
→ File save or stdout
```

### Directory Structure
```
.opencode/
├── tool/
│   └── youtube-transcript.ts    # Existing tool
└── agent/
    ├── youtube-processor.ts     # Main orchestration agent
    └── transcript-summarizer.ts # Summarization subagent
```

## Agent Specifications

### 1. transcript-summarizer.ts

**Purpose**: Generate summaries from video transcripts with user guidance

**Input Schema:**
```typescript
{
  transcript: string (describe: "Full video transcript to summarize"),
  video_title: string (describe: "Title of the video for context"),
  summary_guidance?: string (describe: "Optional guidance for summary style (e.g., 'brief overview', 'detailed analysis', 'key points only')")
}
```

**Output Schema:**
```typescript
{
  summary: string (describe: "Generated summary of the transcript"),
  summary_type: string (describe: "Type of summary generated: 'key_points', 'detailed', or 'guided'")
}
```

**Logic:**
- If `summary_guidance` provided → follow user's guidance
- If no guidance → default to "key points" format
- Handle empty/unavailable transcripts gracefully

### 2. youtube-processor.ts

**Purpose**: Main orchestration agent that handles the complete workflow

**Input Schema:**
```typescript
{
  youtube_input: string (describe: "YouTube URL or video ID"),
  user_comments?: string (describe: "Your comments/thoughts on the video"),
  output_location?: string (describe: "Directory path to save the markdown file"),
  summary_guidance?: string (describe: "Optional guidance for summary style")
}
```

**Core Logic Flow:**
1. **Input Processing**: Extract video ID from URL or validate direct ID
2. **Data Fetching**: Call `youtube-transcript` tool for metadata and transcript
3. **User Interaction**: Leverage opencode's interactive prompts for missing inputs
4. **Summarization**: Call `transcript-summarizer` agent with transcript and guidance
5. **Markdown Generation**: Create Obsidian-formatted content
6. **File Handling**: Save to specified location or fallback to stdout
7. **Conflict Resolution**: Ask user if file exists

## Utility Functions

### URL/ID Extraction
```typescript
function extractVideoId(input: string): string {
  // Handle: https://www.youtube.com/watch?v=VIDEO_ID
  // Handle: https://youtu.be/VIDEO_ID  
  // Handle: https://m.youtube.com/watch?v=VIDEO_ID
  // Handle: Direct VIDEO_ID (11 chars, alphanumeric + -_)
  // Validate using existing tool's validation
}
```

### Obsidian Markdown Generation
```typescript
function generateObsidianMarkdown(data: {
  title: string,
  videoId: string,
  videoUrl: string,
  userComments?: string,
  summary?: string,
  description: string,
  processedDate: Date
}): string {
  // YAML frontmatter with user's locale date format
  // Conditional sections for comments and summary
  // Proper markdown formatting
}
```

### File Operations
```typescript
async function saveMarkdownFile(content: string, filename: string, directory: string): Promise<void> {
  // Check directory existence
  // Handle file conflicts (ask user)
  // Save with proper encoding
  // Provide success feedback
}
```

## Output Format

### Final Markdown Structure
```markdown
---
title: "Video Title Here"
video_id: "dQw4w9WgXcQ"
video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
processed_date: "2025-12-05"  // User's locale format
tags: ["youtube", "video"]
---

# Your Comments
[User's comments - only if provided]

# Summary
[AI-generated summary - only if transcript available]

# Video Description
[Original video description from YouTube metadata]
```

## Error Handling Strategy

### Graceful Degradation
- No transcript → Create file with metadata + comments only
- Missing API key → Clear error message with setup instructions
- Invalid video ID → Validation error with format examples
- File permission errors → Fallback to stdout with error message
- Network failures → Retry logic with exponential backoff

### User Experience
- Clear error messages with actionable solutions
- Progress feedback for long operations
- Confirmation for destructive actions (file overwrites)

## Integration with OpenCode Framework

### Interactive Prompts
- Leverage opencode's built-in prompting system for missing inputs
- Use schema validation for input sanitization
- Provide helpful descriptions and examples

### Tool/Agent Communication
- Import existing `youtube-transcript` tool directly
- Call `transcript-summarizer` agent through opencode's agent system
- Handle async operations properly with error boundaries

### Context Management
- Use provided context for session tracking
- Handle abort signals for long-running operations
- Maintain state across agent calls if needed

## Testing Strategy

### Test Scenarios
1. Full YouTube URL with comments and output location
2. Video ID only, no comments, no output location
3. Invalid URL/ID formats
4. Video without available transcript
5. File already exists in target location
6. Permission denied for output directory
7. Network connectivity issues

### Validation
- Type checking with TypeScript
- Schema validation for all inputs
- Integration testing with real YouTube videos
- Edge case handling verification

## Dependencies

### Current Dependencies (✓ Available)
- `@opencode-ai/plugin` - Agent framework
- `typescript` - Type safety
- Existing `youtube-transcript` tool

### No Additional Dependencies Required
- Use Node.js built-in `fs` for file operations
- Use built-in `URL` class for URL parsing
- Use `Intl.DateTimeFormat` for locale-aware dates

## Implementation Steps

1. **Create directory structure** (`.opencode/agent/`)
2. **Implement summarization subagent** first (simpler, focused task)
3. **Implement main agent** with all orchestration logic
4. **Add utility functions** for URL extraction and markdown generation
5. **Test with various inputs** (URLs, IDs, missing comments, etc.)
6. **Handle edge cases** (no transcript, invalid paths, etc.)
7. **Add type checking and validation**

## Key Features Summary

✅ Follows opencode best practices and patterns
✅ Handles all specified requirements
✅ Provides excellent user experience through interactive prompts
✅ Generates proper Obsidian-formatted markdown
✅ Handles edge cases gracefully
✅ Maintains type safety and error handling
✅ Supports user's locale for date formatting
✅ Respects file conflicts and asks user for resolution
✅ Integrates seamlessly with existing youtube-transcript tool

## Notes

- The implementation will use the existing `sanitizeTitle()` function from the youtube-transcript tool
- File naming will follow the pattern: `{sanitized_title}.md`
- The system will work with both YouTube URLs and direct video IDs
- All user interaction will be handled through opencode's interactive prompting system
- The summarization agent will be flexible to accommodate different summary styles based on user guidance