# Python Setup Guide

This guide covers setting up the Python implementation of the YouTube processor.

## Prerequisites

### Python Version

- **Python 3.13+** is required
- Check your version: `python3 --version`

### YouTube Data API v3 Key

Required for fetching video metadata:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-org/yt-processor.git
cd yt-processor
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

For development:
```bash
pip install -r requirements-dev.txt
```

### 4. Configure Environment

Create a `.env` file (optional, for local development):

```bash
YOUTUBE_API_KEY=your_api_key_here
DEBUG=yt-processor  # Optional: enable debug output
```

Or set environment variables directly:

```bash
export YOUTUBE_API_KEY="your_api_key_here"
export DEBUG="yt-processor"  # Optional
```

### 5. Install OpenCode Agents

#### Global Installation

```bash
# Create config directory if it doesn't exist
mkdir -p ~/.config/opencode

# Copy agents to global config
cp -r .opencode ~/.config/opencode/
```

#### Project Installation

```bash
# Navigate to your target project
cd /path/to/your/project

# Copy agents to project
cp -r /path/to/yt-processor/.opencode .opencode
```

## Development Workflow

### Running Tests

```bash
# Run all tests
python test-agents.py

# Run unit tests only
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=opencode --cov-report=html
```

### Code Quality

```bash
# Format code
black .opencode/ tests/

# Lint code
ruff check .opencode/ tests/

# Type checking
mypy .opencode/
```

### Debug Mode

Enable debug output by setting:

```bash
export DEBUG="yt-processor"
```

Or add to `.env` file:

```
DEBUG=yt-processor
```

## Project Structure

```
yt-processor/
├── .opencode/
│   ├── tool/
│   │   └── youtube_transcript.py    # Main tool
│   ├── agent/
│   │   ├── youtube-processor.md     # Main agent
│   │   └── transcript-summarizer.md # Summarization agent
│   └── utils/
│       └── sanitize.py               # Title sanitization
├── tests/
│   ├── test_youtube_transcript.py  # Tool tests
│   ├── test_sanitize.py           # Utility tests
│   └── conftest.py               # Test configuration
├── requirements.txt               # Runtime dependencies
├── requirements-dev.txt           # Development dependencies
├── pyproject.toml               # Project configuration
├── test-agents.py               # Integration tests
└── README.md                   # Project documentation
```

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure virtual environment is activated
2. **Import errors**: Run `pip install -r requirements.txt`
3. **API key errors**: Verify `YOUTUBE_API_KEY` is set correctly
4. **Permission denied**: Check file permissions for `.opencode` directory

### Getting Help

- Check the [README.md](README.md) for general information
- See [AGENT_USAGE.md](AGENT_USAGE.md) for usage examples
- Review test files for implementation examples

## Migration from TypeScript

If you're migrating from the TypeScript version:

1. The tool interface remains identical
2. Agent configurations are unchanged
3. Environment variables are the same
4. Output format is preserved

The only change is the underlying implementation language - all external interfaces remain the same.