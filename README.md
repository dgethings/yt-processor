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

## Usage

### OpenCode Agents (Recommended)

The easiest way to use this project is through the opencode agents:

#### YouTube Processor Agent
Complete workflow from YouTube URL to Obsidian markdown file:

```typescript
import youtubeProcessor from './.opencode/agent/youtube-processor'

// Basic usage
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
- Invalid video IDs throw validation errors
- Missing API keys throw configuration errors
- Network failures are handled gracefully
- Videos without transcripts return a descriptive message
- File conflicts prompt user for resolution
- Graceful degradation when transcripts unavailable

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

# Run tests
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