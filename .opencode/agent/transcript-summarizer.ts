import { tool } from "@opencode-ai/plugin"

interface SummaryResult {
  summary: string
  summary_type: string
}

function generateKeyPointsSummary(transcript: string, videoTitle: string): string {
  // Extract key points from transcript
  const sentences = transcript.split('.').filter(s => s.trim().length > 20)
  
  // Simple heuristic: look for sentences with indicators of importance
  const keyPointIndicators = [
    'important', 'key', 'main', 'primary', 'essential', 'crucial',
    'first', 'second', 'third', 'finally', 'in conclusion',
    'remember', 'note that', 'keep in mind', 'the point is'
  ]
  
  const keyPoints = sentences
    .filter(sentence => 
      keyPointIndicators.some(indicator => 
        sentence.toLowerCase().includes(indicator)
      )
    )
    .slice(0, 5) // Limit to top 5 key points
    .map(point => point.trim())
  
  if (keyPoints.length === 0) {
    // Fallback: take first few sentences as summary
    return sentences.slice(0, 3).join('. ').trim() + '.'
  }
  
  return `## Key Points\n\n${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}`
}

function generateDetailedSummary(transcript: string, videoTitle: string): string {
  // Create a more comprehensive summary
  const words = transcript.split(' ')
  const targetLength = Math.min(300, Math.floor(words.length * 0.3)) // 30% or 300 words max
  const sentences = transcript.split('.').filter(s => s.trim().length > 10)
  
  // Take sentences from beginning, middle, and end for balanced summary
  const beginning = sentences.slice(0, Math.ceil(sentences.length * 0.2))
  const middleStart = Math.floor(sentences.length * 0.4)
  const middle = sentences.slice(middleStart, middleStart + Math.ceil(sentences.length * 0.3))
  const end = sentences.slice(-Math.ceil(sentences.length * 0.2))
  
  const summarySentences = [...beginning, ...middle, ...end]
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  let summary = summarySentences.join('. ').trim()
  
  // Truncate to target length
  if (summary.length > targetLength * 5) { // rough word count
    const summaryWords = summary.split(' ').slice(0, targetLength)
    summary = summaryWords.join(' ')
    if (!summary.endsWith('.')) {
      summary += '...'
    }
  }
  
  return `## Summary\n\n${summary}`
}

function generateGuidedSummary(transcript: string, videoTitle: string, guidance: string): string {
  // Generate summary based on user guidance
  const guidanceLower = guidance.toLowerCase()
  
  if (guidanceLower.includes('brief') || guidanceLower.includes('short') || guidanceLower.includes('overview')) {
    return generateKeyPointsSummary(transcript, videoTitle)
  } else if (guidanceLower.includes('detailed') || guidanceLower.includes('comprehensive') || guidanceLower.includes('analysis')) {
    return generateDetailedSummary(transcript, videoTitle)
  } else if (guidanceLower.includes('key') || guidanceLower.includes('points') || guidanceLower.includes('bullet')) {
    return generateKeyPointsSummary(transcript, videoTitle)
  } else {
    // Try to incorporate guidance into the summary
    const baseSummary = generateDetailedSummary(transcript, videoTitle)
    return `## Summary (Based on: ${guidance})\n\n${baseSummary}`
  }
}

export default tool({
  description: "Summarize YouTube video transcripts with optional guidance",
  args: {
    transcript: tool.schema.string().describe("Full video transcript to summarize"),
    video_title: tool.schema.string().describe("Title of the video for context"),
    summary_guidance: tool.schema.string().optional().describe("Optional guidance for summary style (e.g., 'brief overview', 'detailed analysis', 'key points only')")
  },
  async execute(args, context): Promise<string> {
    try {
      const { transcript, video_title, summary_guidance } = args
      
      // Handle empty or unavailable transcript
      if (!transcript || transcript.trim() === '' || 
          transcript.includes("No transcript available for this video")) {
        const result: SummaryResult = {
          summary: "No transcript available for this video. The video may not have captions or they may not be accessible through the public API.",
          summary_type: "unavailable"
        }
        return JSON.stringify(result)
      }
      
      let summary: string
      let summaryType: string
      
      if (summary_guidance) {
        summary = generateGuidedSummary(transcript, video_title, summary_guidance)
        summaryType = "guided"
      } else {
        // Default to key points
        summary = generateKeyPointsSummary(transcript, video_title)
        summaryType = "key_points"
      }
      
      const result: SummaryResult = {
        summary,
        summary_type: summaryType
      }
      
      return JSON.stringify(result)
    } catch (error) {
      throw new Error(`Transcript summarizer failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
})