# YouTube Processor

A TypeScript tool for extracting YouTube video transcripts and metadata. This tool provides a simple interface to fetch video information including titles, descriptions, and available transcripts.

## Features

- 🎥 Fetch YouTube video metadata (title, description)
- 📝 Extract video transcripts from available captions
- 🔧 Robust error handling with graceful fallbacks
- 🌍 Multi-language transcript support (English variants)
- ✅ Input validation for YouTube video IDs
- 🔒 Environment variable configuration for API keys

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

### As an OpenCode Tool

This tool is designed to work with the OpenCode framework:

```typescript
import youtubeTranscript from './.opencode/tool/youtube-transcript'

// Get video transcript and metadata
const result = await youtubeTranscript.execute({
  video_id: "dQw4w9WgXcQ"
})

console.log(result)
// Output:
// {
//   video_id: "dQw4w9WgXcQ",
//   title: "Never Gonna Give You Up",
//   transcript: "We're no strangers to love...",
//   description: "Music video by Rick Astley..."
// }
```

### Video ID Format

YouTube video IDs are 11-character strings that contain:
- Alphanumeric characters (a-z, A-Z, 0-9)
- Hyphens (-) and underscores (_)

Example valid IDs: `dQw4w9WgXcQ`, `jNQXAC9IVRw`

## API Reference

### `youtubeTranscript.execute(args)`

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

## Development

### Build Commands

```bash
# Install dependencies
npm install

# Type checking
npx tsc --noEmit

# Linting (if ESLint is configured)
npx eslint .

# Code formatting (if Prettier is configured)
npx prettier --write .
```

### Project Structure

```
yt-processor/
├── .opencode/
│   └── tool/
│       └── youtube-transcript.ts    # Main tool implementation
├── node_modules/                    # Dependencies
├── AGENTS.md                        # Development guidelines
├── package.json                     # Project configuration
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