import { tool } from "@opencode-ai/plugin"
import { sanitizeTitle } from '../utils/sanitize.js'

interface YouTubeVideoInfo {
  video_id: string
  title: string
  transcript: string
  description: string
}

interface YouTubeApiResponse {
  items: Array<{
    snippet: {
      title: string
      description: string
    }
  }>
}

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

function parseTranscriptXML(xmlText: string): string {
  if (!xmlText || xmlText.trim() === '') {
    return ''
  }
  
  const textMatches = xmlText.match(/<text[^>]*>([^<]*)<\/text>/g)
  if (!textMatches) {
    return ''
  }
  
  return textMatches
    .map(match => match.replace(/<text[^>]*>([^<]*)<\/text>/, '$1'))
    .join(' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

async function getYouTubeTranscript(videoId: string): Promise<string> {
  validateYouTubeVideoId(videoId)
  
  // Try multiple approaches to get transcript
  
  // Method 1: Try direct timedtext endpoint with different languages
  const languages = ['en', 'en-US', 'en-GB']
  
  for (const lang of languages) {
    try {
      const transcriptUrl = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=srv1`
      const response = await fetch(transcriptUrl)
      
      if (response.ok) {
        const text = await response.text()
        const transcriptText = parseTranscriptXML(text)
        
        if (transcriptText) {
          return transcriptText
        }
      }
    } catch (error) {
      console.debug(`Transcript fetch failed for lang=${lang}: ${error instanceof Error ? error.message : String(error)}`)
      // Continue to next method
    }
  }
  
  // Method 2: Try without language specification
  try {
    const transcriptUrl = `https://video.google.com/timedtext?v=${videoId}&fmt=srv1`
    const response = await fetch(transcriptUrl)
    
    if (response.ok) {
      const text = await response.text()
      const transcriptText = parseTranscriptXML(text)
      
      if (transcriptText) {
        return transcriptText
      }
    }
  } catch (error) {
    console.debug(`Transcript fetch failed for fallback method: ${error instanceof Error ? error.message : String(error)}`)
    // Continue to fallback
  }
  
  // If all methods fail, return a placeholder message instead of throwing
  return "No transcript available for this video. The video may not have captions or they may not be accessible through the public API."
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
    
    const data = await response.json() as YouTubeApiResponse
    
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
})