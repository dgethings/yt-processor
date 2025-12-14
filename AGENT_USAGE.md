# YouTube Processor Agents - Usage Guide

## Overview

This project provides two opencode agents for processing YouTube videos and generating Obsidian-formatted markdown files:

1. **youtube-processor** - Main orchestration agent
2. **transcript-summarizer** - Summarization subagent

## Setup

### Prerequisites

1. **Python 3.13+**: Required for running the Python implementation

2. **YouTube Data API v3 Key**:
   ```bash
   export YOUTUBE_API_KEY="your_api_key_here"
   ```

3. **Setup Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Agent Usage

### 1. YouTube Processor (Main Agent)

**Purpose**: Complete workflow from YouTube URL/ID to Obsidian markdown file

**Parameters**:
- `youtube_input` (required): YouTube URL or video ID
- `user_comments` (optional): Your thoughts/comments on the video
- `output_location` (optional): Directory path to save the markdown file
- `summary_guidance` (optional): How to summarize (e.g., "brief overview", "detailed analysis", "key points")
- `overwrite_file` (optional): Set to true to overwrite existing files

**Example Usage**:
```javascript
// Basic usage - just get the markdown content
const result = await youtubeProcessor.execute({
  youtube_input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
})

// With comments and custom summary
const result = await youtubeProcessor.execute({
  youtube_input: "dQw4w9WgXcQ",
  user_comments: "This is a classic meme video that everyone should know!",
  summary_guidance: "brief overview"
})

// Save to specific directory
const result = await youtubeProcessor.execute({
  youtube_input: "https://youtu.be/dQw4w9WgXcQ",
  user_comments: "Great educational content",
  output_location: "/Users/username/Documents/ObsidianVault/Videos",
  overwrite_file: true
})
```

### 2. Transcript Summarizer (Subagent)

**Purpose**: Generate summaries from video transcripts

**Parameters**:
- `transcript` (required): Full video transcript text
- `video_title` (required): Title of the video for context
- `summary_guidance` (optional): Summary style guidance

**Example Usage**:
```javascript
const result = await transcriptSummarizer.execute({
  transcript: "This is the full transcript text...",
  video_title: "How to Learn Programming",
  summary_guidance: "key points only"
})
```

## Input Formats

### YouTube URL Formats Supported:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- Direct video ID: `dQw4w9WgXcQ`

### Summary Guidance Options:
- `"brief overview"` or `"short"` → Key points format
- `"detailed analysis"` or `"comprehensive"` → Detailed summary
- `"key points"` or `"bullet points"` → Bulleted list
- Custom guidance → Incorporated into summary

## Output Format

The generated Obsidian markdown files include:

### YAML Frontmatter:
```yaml
---
title: "Video Title"
video_id: "dQw4w9WgXcQ"
video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
processed_date: "December 5, 2025"
tags: ["youtube", "video"]
---
```

### Content Sections:
1. **Your Comments** (if provided)
2. **Summary** (if transcript available)
3. **Video Description** (from YouTube metadata)

### Example Output:
```markdown
---
title: "Never Gonna Give You Up"
video_id: "dQw4w9WgXcQ"
video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
processed_date: "December 5, 2025"
tags: ["youtube", "video"]
---

# Your Comments
This is a classic internet meme video!

# Summary
## Key Points
1. We're no strangers to love
2. You know the rules and so do I
3. Never gonna give you up

# Video Description
Music video by Rick Astley performing "Never Gonna Give You Up"...
```

## Error Handling

The agents handle various error scenarios gracefully:

- **Invalid video ID/URL**: Clear error with format examples
- **No transcript available**: Creates file with metadata only
- **Missing API key**: Setup instructions provided
- **File already exists**: Prompts for overwrite or returns content
- **Network issues**: Retry logic with helpful error messages

## File Naming

- Uses video title with sanitization for filesystem compatibility
- Removes invalid characters: `< > : " / \ | ? *`
- Replaces colons with hyphens
- Removes square brackets
- Appends `.md` extension

Example: `"Never Gonna Give You Up - Official Video"` → `"Never Gonna Give You Up - Official Video.md"`

## Testing

Run the test script to verify functionality (requires `YOUTUBE_API_KEY` environment variable):

```bash
python test-agents.py
```

This will test:
1. YouTube transcript tool (requires API key)
2. Transcript summarizer (works without API key)
3. YouTube processor agent (requires API key)

**Note**: The YouTube transcript tool and processor agent tests will fail without a valid YouTube Data API v3 key. The transcript summarizer test runs independently.

### Unit Tests

Run unit tests with pytest:

```bash
python -m pytest tests/ -v
```

This will test:
1. Video ID validation
2. Title sanitization
3. Transcript fetching (mocked)
4. Metadata fetching (mocked)
5. Error handling scenarios

## Integration with OpenCode

These agents are designed to work within the opencode framework:

- Interactive prompts for missing parameters
- Schema validation for all inputs
- Proper error handling and user feedback
- Integration with opencode's tool/agent system

## Development

### Type Checking:
```bash
npx tsc --noEmit
```

### Compilation:
```bash
npx tsc
```

### Project Structure:
```
.opencode/
├── tool/
│   └── youtube-transcript.ts    # Existing tool
└── agent/
    ├── youtube-processor.ts     # Main agent
    └── transcript-summarizer.ts # Summarization agent
```

## Notes

- The system respects YouTube's Terms of Service
- API quota limits apply (10,000 units/day for standard API key)
- **Quota Details**: Each video metadata fetch costs 1 unit; transcripts are free (not counted against quota)
- **Cost**: Free up to 10,000 units/day; additional quota available for purchase through Google Cloud
- **Monitoring**: Check usage at [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → YouTube Data API v3 → Quotas
- Some videos may not have accessible transcripts
- All dates are formatted using the user's locale settings
- File operations require appropriate filesystem permissions