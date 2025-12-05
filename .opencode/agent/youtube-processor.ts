import { tool } from "@opencode-ai/plugin"
import fs from 'fs/promises'
import path from 'path'
import youtubeTranscript from '../tool/youtube-transcript'
import transcriptSummarizer from './transcript-summarizer'

interface YouTubeVideoInfo {
  video_id: string
  title: string
  transcript: string
  description: string
}

interface SummaryResult {
  summary: string
  summary_type: string
}

function extractVideoId(input: string): string {
  const trimmedInput = input.trim()
  
  // Handle direct video ID (11 characters, alphanumeric + hyphens + underscores)
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/
  if (videoIdPattern.test(trimmedInput)) {
    return trimmedInput
  }
  
  // Handle various YouTube URL formats
  const urlPatterns = [
    // Standard YouTube URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // YouTube shorts
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of urlPatterns) {
    const match = trimmedInput.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  throw new Error(`Invalid YouTube URL or video ID: "${input}". Expected format: https://www.youtube.com/watch?v=VIDEO_ID or direct 11-character video ID.`)
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/:/g, '-')
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .trim()
}

function generateObsidianMarkdown(data: {
  title: string
  videoId: string
  videoUrl: string
  userComments?: string
  summary?: string
  description: string
  processedDate: Date
}): string {
  // Format date using user's locale
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedDate = dateFormatter.format(data.processedDate)
  
  let markdown = `---
title: "${data.title.replace(/"/g, '\\"')}"
video_id: "${data.videoId}"
video_url: "${data.videoUrl}"
processed_date: "${formattedDate}"
tags: ["youtube", "video"]
---

`
  
  // Add user comments section if provided
  if (data.userComments && data.userComments.trim()) {
    markdown += `# Your Comments

${data.userComments.trim()}

`
  }
  
  // Add summary section if available
  if (data.summary && data.summary.trim()) {
    markdown += `# Summary

${data.summary.trim()}

`
  }
  
  // Add video description section
  markdown += `# Video Description

${data.description.trim() || 'No description available.'}`
  
  return markdown
}

async function saveMarkdownFile(content: string, filename: string, directory: string): Promise<string> {
  try {
    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true })
    
    const filePath = path.join(directory, filename)
    
    // Check if file already exists
    try {
      await fs.access(filePath)
      // File exists, we'll need to handle this in the main logic
      return filePath
    } catch {
      // File doesn't exist, we can proceed
    }
    
    // Write the file
    await fs.writeFile(filePath, content, 'utf-8')
    return filePath
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default tool({
  description: "Process YouTube video and generate Obsidian markdown file with transcript summary",
  args: {
    youtube_input: tool.schema.string().describe("YouTube URL or video ID"),
    user_comments: tool.schema.string().optional().describe("Your comments/thoughts on the video"),
    output_location: tool.schema.string().optional().describe("Directory path to save the markdown file"),
    summary_guidance: tool.schema.string().optional().describe("Optional guidance for summary style"),
    overwrite_file: tool.schema.boolean().optional().describe("Overwrite existing file if it exists")
  },
  async execute(args, context): Promise<string> {
    try {
      const { youtube_input, user_comments, output_location, summary_guidance, overwrite_file } = args
      
      // Step 1: Extract video ID
      const videoId = extractVideoId(youtube_input)
      
      // Step 2: Get video metadata and transcript
      const youtubeResult = await youtubeTranscript.execute({ video_id: videoId }, context)
      const videoInfo: YouTubeVideoInfo = JSON.parse(youtubeResult)
      
      // Step 3: Generate summary if transcript is available
      let summary: string | undefined
      if (videoInfo.transcript && !videoInfo.transcript.includes("No transcript available")) {
        const summaryResult = await transcriptSummarizer.execute({
          transcript: videoInfo.transcript,
          video_title: videoInfo.title,
          summary_guidance: summary_guidance
        }, context)
        
        const summaryData: SummaryResult = JSON.parse(summaryResult)
        summary = summaryData.summary
      }
      
      // Step 4: Generate Obsidian markdown
      const markdownContent = generateObsidianMarkdown({
        title: videoInfo.title,
        videoId: videoInfo.video_id,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        userComments: user_comments,
        summary: summary,
        description: videoInfo.description,
        processedDate: new Date()
      })
      
      // Step 5: Handle file output
      const filename = `${sanitizeTitle(videoInfo.title)}.md`
      
      if (output_location) {
        // Save to specified location
        const filePath = path.join(output_location, filename)
        
        // Check if file exists and handle overwrite
        try {
          await fs.access(filePath)
          if (overwrite_file !== true) {
            return `File already exists at ${filePath}. Set overwrite_file=true to overwrite it.\n\n${markdownContent}`
          }
        } catch {
          // File doesn't exist, proceed
        }
        
        await saveMarkdownFile(markdownContent, filename, output_location)
        return `Successfully saved Obsidian markdown file to: ${path.join(output_location, filename)}`
      } else {
        // Return content for user to save manually
        return `No output location specified. Here's the Obsidian markdown content:\n\n${markdownContent}`
      }
      
    } catch (error) {
      throw new Error(`YouTube processor failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
})