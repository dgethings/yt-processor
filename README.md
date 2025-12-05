# YouTube Processor

A comprehensive TypeScript toolkit for processing YouTube videos with opencode agents. This project provides tools and agents for extracting video metadata, transcripts, generating summaries, and creating Obsidian-formatted markdown files.

## Features

### Core Tool
- 🎥 Fetch YouTube video metadata (title, description)
- 📝 Extract video transcripts from available captions
- 🔧 Robust error handling with graceful fallbacks
- 🌍 Multi-language transcript support (English variants)
- ✅ Input validation for YouTube video IDs
- 🔒 Environment variable configuration for API keys

### OpenCode Agents
- 🤖 **YouTube Processor Agent**: Complete workflow from URL to Obsidian markdown
- 📋 **Transcript Summarizer Agent**: Intelligent transcript summarization with user guidance
- 📝 **Obsidian Integration**: Generate properly formatted markdown files with YAML frontmatter
- 🔗 **URL Support**: Handle various YouTube URL formats and direct video IDs
- 💬 **User Comments**: Integrate personal thoughts with AI-generated summaries

## Installation

```bash
npm install
```

## Setup

### Prerequisites

1. **YouTube Data API v3 Key**: Required for fetching video metadata
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API Key)
   - Copy your API key

2. **Environment Configuration**:
   ```bash
   export YOUTUBE_API_KEY="your_api_key_here"
   ```

    Or create a `.env` file:
    ```
    YOUTUBE_API_KEY=your_api_key_here
    ```

### API Quota and Limits

The YouTube Data API v3 has the following quota and cost structure:

- **Daily Quota**: 10,000 units per day for standard API keys
- **Cost**: Free up to the daily quota limit
- **Metadata Fetch**: 1 unit per video (title, description, etc.)
- **Transcript Fetch**: 0 units (uses YouTube's timedtext endpoint, not the API)
- **Quota Exceeded**: If you exceed the free quota, you'll need to purchase additional quota through Google Cloud

**Monitoring Usage:**
- Check your quota usage in the [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services → YouTube Data API v3 → Quotas
- Monitor your daily usage to avoid unexpected costs

**Cost Information:**
YouTube Data API v3 is free for up to 10,000 units per day. If you need more quota, Google Cloud offers paid plans starting at $0.50 per 1,000 units (as of 2025 pricing).

## Configuration

### TypeScript Configuration

The project uses TypeScript with the following key settings in `tsconfig.json`:

- **Target**: ES2020 modules for modern JavaScript compatibility
- **Module**: ESNext for native ES modules support
- **Strict Mode**: Enabled for type safety (`strict: true`)
- **noImplicitAny**: Currently disabled to allow gradual migration to stricter typing
- **ES Module Interop**: Enabled for compatibility with CommonJS modules
- **Declaration Files**: Generated in `dist/` directory

### Build Output

After running `npm run build` or `npx tsc`, the compiled JavaScript files are placed in the `dist/` directory:

```
dist/
├── .opencode/
│   ├── tool/
│   │   └── youtube-transcript.js    # Compiled tool
│   └── agent/
│       ├── youtube-processor.js     # Main agent
│       └── transcript-summarizer.js # Summarizer agent
└── utils/
    └── sanitize.js                  # Utility functions
```

### Integration with Other Projects

To use this project in other applications:

1. **As a dependency**: Add to your `package.json` and import the compiled JavaScript files
2. **As source**: Copy the `.opencode/` directory and modify as needed
3. **Environment**: Ensure `YOUTUBE_API_KEY` is available in the target environment
4. **Dependencies**: Install required packages (`@opencode-ai/plugin`, `zod`)

## Usage

### OpenCode Agents (Recommended)

The easiest way to use this project is through the opencode agents:

#### YouTube Processor Agent
Complete workflow from YouTube URL to Obsidian markdown file:

```typescript
import youtubeProcessor from './.opencode/agent/youtube-processor'

// Basic usage (using Rick Astley's "Never Gonna Give You Up" as example)
const result = await youtubeProcessor.execute({
  youtube_input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  user_comments: "This is a classic meme video!",
  output_location: "/path/to/obsidian/vault"
})

// With custom summary guidance
const result = await youtubeProcessor.execute({
  youtube_input: "dQw4w9WgXcQ",
  summary_guidance: "brief overview",
  user_comments: "Great educational content about programming"
})
```

#### Transcript Summarizer Agent
Generate intelligent summaries from video transcripts:

```typescript
import transcriptSummarizer from './.opencode/agent/transcript-summarizer'

const result = await transcriptSummarizer.execute({
  transcript: "Full video transcript text...",
  video_title: "How to Learn Programming",
  summary_guidance: "key points only"
})
```

### As an OpenCode Tool

Direct access to the underlying tool:

```typescript
import youtubeTranscript from './.opencode/tool/youtube-transcript'

// Get video transcript and metadata
const result = await youtubeTranscript.execute({
  video_id: "dQw4w9WgXcQ"
})

console.log(JSON.parse(result))
// Output:
// {
//   video_id: "dQw4w9WgXcQ",
//   title: "Never Gonna Give You Up",
//   transcript: "We're no strangers to love...",
//   description: "Music video by Rick Astley..."
// }
```

### Input Formats

#### YouTube URL Formats Supported:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- Direct video ID: `dQw4w9WgXcQ`

#### Video ID Format
YouTube video IDs are 11-character strings that contain:
- Alphanumeric characters (a-z, A-Z, 0-9)
- Hyphens (-) and underscores (_)

Example valid IDs: `dQw4w9WgXcQ`, `jNQXAC9IVRw`

## API Reference

### YouTube Processor Agent

**Parameters:**
- `youtube_input` (string): YouTube URL or video ID
- `user_comments` (string, optional): Your thoughts on the video
- `output_location` (string, optional): Directory to save markdown file
- `summary_guidance` (string, optional): How to summarize the content
- `overwrite_file` (boolean, optional): Overwrite existing files

**Returns:** String with file path or markdown content

### Transcript Summarizer Agent

**Parameters:**
- `transcript` (string): Full video transcript
- `video_title` (string): Video title for context
- `summary_guidance` (string, optional): Summary style guidance

**Returns:** JSON string with summary and summary_type

### YouTube Transcript Tool

**Parameters:**
- `video_id` (string): The YouTube video ID to process

**Returns:**
```typescript
interface YouTubeVideoInfo {
  video_id: string
  title: string
  transcript: string
  description: string
}
```

**Error Handling:**

The agents provide detailed error messages and recovery guidance:

| Error | Example Message | Cause | Solution |
|-------|----------------|-------|----------|
| **Invalid YouTube video ID format** | `Invalid YouTube URL or video ID: "invalid". Expected format: https://www.youtube.com/watch?v=VIDEO_ID or direct 11-character video ID.` | Malformed video ID or URL | Ensure ID is 11 chars (alphanumeric, `-`, `_`) or use a valid YouTube URL |
| **Missing API key** | `YouTube tool failed: YOUTUBE_API_KEY environment variable not set` | `YOUTUBE_API_KEY` not configured | Run `export YOUTUBE_API_KEY="your_key"` or add to `.env` file |
| **Video not found** | `YouTube tool failed: Video not found or not accessible` | Video is private, deleted, or doesn't exist | Verify video is public and URL/ID is correct |
| **API quota exceeded** | `YouTube tool failed: quotaExceeded` | Daily API quota reached | Check [Google Cloud Console](https://console.cloud.google.com/) quota usage or wait for reset |
| **Network failure** | `YouTube tool failed: fetch failed` | Connection issues or YouTube API down | Retry later or check internet connection |
| **No transcript available** | `No transcript available for this video` | Video has no captions | File created with metadata only (no summary) |
| **File already exists** | `File already exists at /path/to/file.md. Set overwrite_file=true to overwrite it.` | Output file exists and `overwrite_file` not set | Set `overwrite_file: true` or choose different output location |
| **Permission denied** | `Cannot access file path: EACCES: permission denied` | No write access to output directory | Check directory permissions or choose different location |

**Recovery Procedures:**
- **API Issues**: Verify API key in Google Cloud Console and check quota usage
- **Network Issues**: Wait and retry; check YouTube service status
- **File Issues**: Ensure output directory exists and is writable
- **Video Issues**: Confirm video is public and has correct ID

## Output Format

The agents generate Obsidian-compatible markdown files with:

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

## Development

### Build Commands

```bash
# Install dependencies
npm install

# Type checking
npx tsc --noEmit

# Compile TypeScript
npx tsc

# Run tests (requires YOUTUBE_API_KEY environment variable)
node test-agents.js

# Linting (if ESLint is configured)
npx eslint .

# Code formatting (if Prettier is configured)
npx prettier --write .
```

### Project Structure

```
yt-processor/
├── .opencode/
│   ├── tool/
│   │   └── youtube-transcript.ts    # Core tool implementation
│   └── agent/
│       ├── youtube-processor.ts     # Main orchestration agent
│       └── transcript-summarizer.ts # Summarization subagent
├── dist/                            # Compiled JavaScript output
├── node_modules/                    # Dependencies
├── AGENTS.md                        # Development guidelines
├── IMPLEMENTATION_PLAN.md          # Detailed implementation plan
├── AGENT_USAGE.md                   # Agent usage guide
├── package.json                     # Project configuration
├── tsconfig.json                    # TypeScript configuration
├── test-agents.js                   # Test script
└── README.md                        # This file
```

## How It Works

1. **Metadata Fetching**: Uses YouTube Data API v3 to get video title and description
2. **Transcript Extraction**: Attempts multiple methods to fetch transcripts:
   - Direct timedtext endpoint with language preferences
   - Fallback to language-agnostic endpoint
3. **Error Handling**: Graceful degradation when transcripts aren't available

## Limitations

- Only videos with public captions/transcripts will return transcript data
- YouTube API quota limits apply (10,000 units per day for standard API key)
- Some videos may have restricted access to their transcripts
- Transcript availability depends on video creator's caption settings

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for educational and personal use only. Please respect YouTube's Terms of Service and the API usage guidelines. Users are responsible for complying with all applicable laws and regulations when using this tool.