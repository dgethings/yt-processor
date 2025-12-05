# YouTube Processor

A pair of OpenCode agents that summarise a given YouTube video and saves the result to an Obsidian markdown file. This project provides tools and agents for extracting video metadata, transcripts, generating summaries, and creating Obsidian-formatted markdown files.

## Features

### Core Tool

- Fetch YouTube video metadata (title, description)
- Extract video transcripts from available captions
- Robust error handling with graceful fallbacks
- Multi-language transcript support (English variants)
- Input validation for YouTube video IDs
- Environment variable configuration for API keys

### OpenCode Agents

- **YouTube Processor Agent**: Complete workflow from URL to Obsidian markdown
- **Transcript Summarizer Agent**: Intelligent transcript summarization with user guidance
- **Obsidian Integration**: Generate properly formatted markdown files with YAML frontmatter
- **URL Support**: Handle various YouTube URL formats and direct video IDs
- **User Comments**: Integrate personal thoughts with AI-generated summaries

## Installation

### Step 1: Install Dependencies (Optional)

If you want to run tests or develop locally:

```bash
npm install
```

### Step 2: Install Agents and Tools

The YouTube processor agents and tools cannot be installed via npm. You must manually copy them to the appropriate OpenCode configuration directory:

#### Global Installation (Available System-Wide)

Copy the agent and tool directories to your global OpenCode config:

```bash
# Create the config directory if it doesn't exist
mkdir -p ~/.config/opencode/agent
mkdir -p ~/.config/opencode/tool

# Copy the agents and tools
cp -r .opencode/agent/* ~/.config/opencode/agent/
cp -r .opencode/tool/* ~/.config/opencode/tool/
```

If you already have other agents or tools installed, the directories will be merged.

#### Project Installation (Available in Specific Project)

Copy the agent and tool directories to a project's `.opencode` directory:

```bash
# Navigate to your target project
cd /path/to/your/project

# Create the .opencode directory if it doesn't exist
mkdir -p .opencode/agent
mkdir -p .opencode/tool

# Copy the agents and tools
cp -r /path/to/yt-processor/.opencode/agent/* .opencode/agent/
cp -r /path/to/yt-processor/.opencode/tool/* .opencode/tool/
```

If your project already has a `.opencode` directory, the contents will be merged.

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

```bash
YOUTUBE_API_KEY=your_api_key_here
```

### API Quota and Limits

At the time of writing Google has a generous free quota for the YouTube API key. They have the right to change it anytime and I have no control on it if they do.

### Verification

After installation, verify the agents are properly installed by running:

```bash
opencode --help
```

You should see the `youtube-processor` and `transcript-summarizer` agents listed.

## Usage

See [AGENT_USAGE.md](AGENT_USAGE.md) for detailed usage examples and API documentation for the YouTube processor agents.

## Output Format

The agents generate Obsidian-compatible markdown files with:

### YAML Frontmatter

```yaml
---
title: "Video Title"
video_id: "dQw4w9WgXcQ"
video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
processed_date: "December 5, 2025"
tags: ["youtube", "video"]
---
```

### Content Sections

1. Comments (your comments, if provided)
2. Summary (if transcript available)
3. Video Description (from YouTube metadata)

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

