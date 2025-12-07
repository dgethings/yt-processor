import { tool } from "@opencode-ai/plugin"
import { z } from 'zod'
import { YoutubeTranscript } from 't-youtube-transcript-fetcher'
import { sanitizeTitle } from '../utils/sanitize.js'

const DEBUG = process.env.DEBUG === 'yt-processor'

interface YouTubeVideoInfo {
  video_id: string
  title: string
  transcript: string
  description: string
}

const YouTubeApiResponseSchema = z.object({
  items: z.array(z.object({
    snippet: z.object({
      title: z.string(),
      description: z.string()
    })
  }))
})

type YouTubeApiResponse = z.infer<typeof YouTubeApiResponseSchema>

function validateYouTubeVideoId(videoId: string): void {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('Video ID must be a non-empty string')
  }
  
  // YouTube video IDs are typically 11 characters and contain alphanumeric chars, hyphens, and underscores
  const validIdPattern = /^[a-zA-Z0-9_-]{11}$/
  if (!validIdPattern.test(videoId)) {
    throw new Error('Invalid YouTube video ID format')
  }
}



async function getYouTubeTranscript(videoId: string): Promise<string> {
  validateYouTubeVideoId(videoId)

  if (DEBUG) console.log(`[youtube-transcript] Fetching transcript for video ${videoId}`)

  try {
    // Use the t-youtube-transcript-fetcher library to get transcript
    // This library provides robust transcript fetching with automatic language detection
    const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId)

    // Convert the array of transcript segments to a single concatenated string
    const transcriptText = transcriptSegments
      .map(segment => segment.text)
      .join(' ')
      .trim()

    if (!transcriptText) {
      throw new Error('No transcript available for this video. The video may not have captions or they may not be accessible through the public API.')
    }

    return transcriptText
  } catch (error) {
    // Handle library-specific errors and convert to our expected error format
    if (error instanceof Error) {
      // Re-throw with our consistent error message for known library errors
      if (error.message.includes('No transcript') ||
          error.message.includes('Transcript disabled') ||
          error.message.includes('Video unavailable') ||
          error.message.includes('Language not found')) {
        throw new Error('No transcript available for this video. The video may not have captions or they may not be accessible through the public API.')
      }
      // For other errors, include the original message
      throw new Error(`Failed to fetch transcript: ${error.message}`)
    }

    // Fallback for unknown error types
    throw new Error('No transcript available for this video. The video may not have captions or they may not be accessible through the public API.')
  }
}

async function getYouTubeMetadata(videoId: string): Promise<{ title: string; description: string }> {
  validateYouTubeVideoId(videoId)
  
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY environment variable not set')
  }
  
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`)
    }
    
    const data = YouTubeApiResponseSchema.parse(await response.json())
    
    if (!data.items || data.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`)
    }
    
    const video = data.items[0].snippet
    const title = sanitizeTitle(video.title)
    
    return {
      title,
      description: video.description
    }
  } catch (error) {
    throw new Error(`Failed to get metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}



export default tool({
  description: "Get YouTube video transcript and metadata",
  args: {
    video_id: tool.schema.string().describe("YouTube video ID to fetch transcript and metadata for")
  },
  async execute(args, context): Promise<string> {
    // Validate required environment variable
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable not set. Please obtain a YouTube Data API v3 key from Google Cloud Console and set the environment variable.')
    }

    try {
      const { title, description } = await getYouTubeMetadata(args.video_id)
      const transcript = await getYouTubeTranscript(args.video_id)

      const result: YouTubeVideoInfo = {
        video_id: args.video_id,
        title,
        transcript,
        description
      }

      return JSON.stringify(result)
    } catch (error) {
      throw new Error(`YouTube tool failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
}) as any