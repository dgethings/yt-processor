# Contributing to YouTube Processor

Thank you for your interest in contributing to the YouTube Processor project! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git
- A GitHub account

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/your-username/yt-processor.git
   cd yt-processor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   # Copy the example environment file (if available)
   cp .env.example .env
   
   # Add your YouTube API key
   echo "YOUTUBE_API_KEY=your_api_key_here" >> .env
   ```

4. **Verify Setup**
   ```bash
   # Run type checking
   npm run typecheck
   
   # Run linting (if configured)
   npm run lint
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the existing code style and conventions
- Add TypeScript types for all new code
- Include error handling where appropriate
- Update documentation if needed

### 3. Test Your Changes

```bash
# Type checking
npx tsc --noEmit

# If you add tests
npm test

# Manual testing with the tool
node -e "
import youtubeTranscript from './.opencode/tool/youtube-transcript.js';
youtubeTranscript.execute({video_id: 'dQw4w9WgXcQ'})
  .then(console.log)
  .catch(console.error);
"
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "feat: add support for multiple transcript languages"
# or
git commit -m "fix: handle invalid video ID validation"
# or
git commit -m "docs: update API documentation"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any relevant issues
- Include screenshots if applicable
- Describe testing performed

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for types/interfaces)
- Use ES6+ syntax and import/export statements
- Include JSDoc comments for public APIs
- Prefer `const` over `let` when possible

### Example Code Style

```typescript
// Good
interface VideoMetadata {
  title: string
  description: string
  publishedAt: Date
}

async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('Video ID must be a non-empty string')
  }
  
  // Implementation...
}

// Avoid
function fetch_data(id) {
  // Implementation...
}
```

### Error Handling

- Use descriptive error messages
- Include context in error messages
- Handle edge cases gracefully
- Log errors appropriately without exposing sensitive information

```typescript
// Good
try {
  const result = await apiCall()
  return result
} catch (error) {
  throw new Error(`Failed to fetch video data: ${error instanceof Error ? error.message : 'Unknown error'}`)
}
```

## Testing

### Unit Tests

If adding unit tests, place them in a `__tests__` directory alongside the source files:

```
.opencode/tool/
├── youtube-transcript.ts
└── __tests__/
    └── youtube-transcript.test.ts
```

### Manual Testing

Test with various YouTube video types:
- Videos with transcripts
- Videos without transcripts
- Private/unlisted videos
- Invalid video IDs
- Videos in different languages

## Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:
- Video ID that reproduces the issue
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Error messages or logs

### ✨ Features

- Open an issue first to discuss the feature
- Provide clear use cases and requirements
- Consider backward compatibility
- Update documentation

### 📝 Documentation

- Fix typos and grammatical errors
- Improve code comments
- Add examples to README
- Update API documentation

### 🔧 Maintenance

- Update dependencies
- Improve build processes
- Add CI/CD improvements
- Refactor code for better performance

## Project Structure

```
yt-processor/
├── .opencode/
│   └── tool/
│       └── youtube-transcript.ts    # Main tool implementation
├── node_modules/                    # Dependencies
├── .gitignore                       # Git ignore rules
├── AGENTS.md                        # Development guidelines
├── CONTRIBUTING.md                   # This file
├── package.json                     # Project configuration
├── README.md                        # Project documentation
└── tsconfig.json                    # TypeScript configuration (if added)
```

## Release Process

Releases are automated using semantic-release and GitHub Actions:

1. Push commits following conventional commit format to main branch
2. GitHub Actions workflow automatically runs tests and builds
3. semantic-release determines version bump based on commit types and:
   - Updates CHANGELOG.md
   - Creates git tag
   - Creates GitHub release

No manual version updates are needed. All releases are triggered by conventional commits.

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- Check existing issues and documentation
- Ask questions in GitHub discussions (if enabled)
- Join community channels (if available)

## Recognition

Contributors are recognized in:
- README.md contributors section
- Git commit history
- Release notes (for significant contributions)

Thank you for contributing to YouTube Processor! 🎉