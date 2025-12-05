// Test script for YouTube processor agents
import youtubeProcessor from './dist/.opencode/agent/youtube-processor.js'
import transcriptSummarizer from './dist/.opencode/agent/transcript-summarizer.js'
import youtubeTranscript from './dist/.opencode/tool/youtube-transcript.js'

async function testYouTubeTranscript() {
  console.log('Testing YouTube transcript tool...')
  try {
    // Test with a known video ID (Rick Astley - Never Gonna Give You Up)
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
    const result = await transcriptSummarizer.execute({
      transcript: testTranscript,
      video_title: "Test Video"
    })
    console.log('✅ Transcript summarizer works')
    console.log('Result:', JSON.parse(result))
    return JSON.parse(result)
  } catch (error) {
    console.error('❌ Transcript summarizer failed:', error.message)
    return null
  }
}

async function testYouTubeProcessor() {
  console.log('\nTesting YouTube processor agent...')
  try {
    const result = await youtubeProcessor.execute({
      youtube_input: 'dQw4w9WgXcQ',
      user_comments: 'This is a classic internet meme video!',
      summary_guidance: 'brief overview'
    })
    console.log('✅ YouTube processor works')
    console.log('Result:', result)
    return result
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