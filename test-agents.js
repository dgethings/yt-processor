// Test script for YouTube processor agents (using OpenCode CLI)
import { execSync } from 'child_process'

function runOpenCodeAgent(agent, message) {
  try {
    const result = execSync(`opencode run --agent ${agent} "${message}"`, {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 1024 * 1024
    })
    return result
  } catch (error) {
    return error.stdout || error.message
  }
}

async function testYouTubeTranscript() {
  console.log('Testing YouTube transcript tool...')
  try {
    // Test the tool directly using the compiled JavaScript
    const { default: youtubeTranscript } = await import('./dist/.opencode/tool/youtube-transcript.js')
    const result = await youtubeTranscript.execute({ video_id: 'dQw4w9WgXcQ' })
    console.log('✅ YouTube transcript tool works')
    console.log('Result:', JSON.parse(result))
    return JSON.parse(result)
  } catch (error) {
    console.error('❌ YouTube transcript tool failed:', error.message)
    return null
  }
}

async function testTranscriptSummarizer() {
  console.log('\nTesting transcript summarizer...')
  try {
    const testTranscript = "This is a test transcript. It contains multiple sentences. The main point is to test the summarization functionality. Key points include testing the system, ensuring it works correctly, and validating the output."
    const message = `transcript: ${testTranscript} video_title: Test Video`
    const result = runOpenCodeAgent('transcript-summarizer', message)

    if (result.includes('"summary_type": "key_points"') || result.includes('"summary_type": "detailed"')) {
      console.log('✅ Transcript summarizer works')
      console.log('Result contains expected JSON structure')
      return { success: true }
    } else {
      console.error('❌ Transcript summarizer failed: unexpected output')
      console.log('Output:', result.substring(0, 500))
      return null
    }
  } catch (error) {
    console.error('❌ Transcript summarizer failed:', error.message)
    return null
  }
}

async function testYouTubeProcessor() {
  console.log('\nTesting YouTube processor agent...')
  try {
    const message = 'youtube_input: dQw4w9WgXcQ user_comments: This is a test comment'
    const result = runOpenCodeAgent('youtube-processor', message)

    if (result.includes('Obsidian') || result.includes('markdown') || result.includes('Successfully saved')) {
      console.log('✅ YouTube processor works')
      console.log('Agent generated markdown output')
      return { success: true }
    } else {
      console.error('❌ YouTube processor failed: unexpected output')
      console.log('Output:', result.substring(0, 500))
      return null
    }
  } catch (error) {
    console.error('❌ YouTube processor failed:', error.message)
    return null
  }
}

async function runTests() {
  console.log('🧪 Running YouTube Processor Agent Tests\n')

  // Check if YouTube API key is set
  if (!process.env.YOUTUBE_API_KEY) {
    console.log('⚠️  YOUTUBE_API_KEY not set. Some tests may fail.')
    console.log('   Set it with: export YOUTUBE_API_KEY="your_api_key"')
  }

  const transcriptResult = await testYouTubeTranscript()
  const summarizerResult = await testTranscriptSummarizer()
  const processorResult = await testYouTubeProcessor()

  console.log('\n📊 Test Summary:')
  console.log('YouTube Transcript Tool:', transcriptResult ? '✅' : '❌')
  console.log('Transcript Summarizer:', summarizerResult ? '✅' : '❌')
  console.log('YouTube Processor:', processorResult ? '✅' : '❌')

  if (transcriptResult && summarizerResult && processorResult) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
  }
}

runTests().catch(console.error)