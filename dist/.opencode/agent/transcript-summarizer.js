import { tool } from "@opencode-ai/plugin";
function generateKeyPointsSummary(transcript, videoTitle) {
    // Validate inputs
    if (!transcript || typeof transcript !== 'string') {
        return "Unable to generate summary: invalid transcript";
    }
    if (!videoTitle || typeof videoTitle !== 'string') {
        return "Unable to generate summary: invalid video title";
    }
    // Improved sentence splitting (handle multiple punctuation marks)
    const sentences = transcript
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10 && s.length < 200); // Filter reasonable sentence lengths
    if (sentences.length === 0) {
        return "Unable to extract meaningful sentences from transcript.";
    }
    // Expanded keyword indicators with better coverage
    const keyPointIndicators = [
        // Importance indicators
        'important', 'key', 'main', 'primary', 'essential', 'crucial', 'critical', 'significant',
        'fundamental', 'core', 'central', 'major', 'vital', 'paramount',
        // Sequence indicators
        'first', 'second', 'third', 'fourth', 'fifth', 'next', 'then', 'after', 'before',
        'finally', 'lastly', 'in conclusion', 'to conclude', 'to summarize', 'in summary',
        // Attention indicators
        'remember', 'note that', 'keep in mind', 'the point is', 'here\'s the thing',
        'what matters', 'what\'s important', 'pay attention', 'focus on',
        // Content indicators
        'let\'s talk about', 'we\'ll cover', 'we\'ll discuss', 'we\'ll explore',
        'the goal is', 'the objective is', 'the purpose is', 'the aim is',
        // Action indicators
        'you need to', 'you should', 'make sure', 'ensure that', 'don\'t forget'
    ];
    // Score sentences based on keyword matches and position
    const scoredSentences = sentences.map((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        let score = 0;
        // Keyword matching score
        const keywordMatches = keyPointIndicators.filter(indicator => lowerSentence.includes(indicator)).length;
        score += keywordMatches * 3;
        // Position bonus (sentences at beginning/middle/end are more important)
        const positionRatio = index / sentences.length;
        if (positionRatio < 0.2)
            score += 2; // Beginning
        else if (positionRatio > 0.8)
            score += 2; // End
        else if (positionRatio > 0.4 && positionRatio < 0.6)
            score += 1; // Middle
        // Length bonus (moderate length sentences)
        const wordCount = sentence.split(' ').length;
        if (wordCount >= 8 && wordCount <= 25)
            score += 1;
        return { sentence, score, index };
    });
    // Sort by score descending, then by position
    scoredSentences.sort((a, b) => {
        if (a.score !== b.score)
            return b.score - a.score;
        return a.index - b.index; // Earlier sentences first for same score
    });
    // Take top sentences, ensuring diversity
    const selectedSentences = [];
    const usedSentenceIndices = new Set();
    for (const item of scoredSentences) {
        // Avoid selecting sentences too close to already selected ones
        const tooClose = Array.from(usedSentenceIndices).some(prevIndex => Math.abs(item.index - prevIndex) < 3 // Minimum 3 sentences apart
        );
        if (!tooClose && selectedSentences.length < 5) {
            selectedSentences.push(item.sentence);
            usedSentenceIndices.add(item.index);
        }
    }
    // If no high-scoring sentences found, use a more comprehensive approach
    if (selectedSentences.length === 0) {
        // Take sentences from different parts of the transcript
        const totalSentences = sentences.length;
        const indices = [
            0, // First sentence
            Math.floor(totalSentences * 0.25), // Early middle
            Math.floor(totalSentences * 0.5), // Middle
            Math.floor(totalSentences * 0.75), // Late middle
            totalSentences - 1 // Last sentence
        ].filter((idx, pos, arr) => arr.indexOf(idx) === pos); // Remove duplicates
        selectedSentences.push(...indices.map(idx => sentences[idx]).filter(Boolean));
    }
    // Ensure we have at least some content
    if (selectedSentences.length === 0) {
        return sentences.slice(0, 3).join('. ').trim() + '.';
    }
    return `## Key Points\n\n${selectedSentences.map((point, index) => `${index + 1}. ${point}`).join('\n')}`;
}
function generateDetailedSummary(transcript, videoTitle) {
    // Validate inputs
    if (!transcript || typeof transcript !== 'string') {
        return "Unable to generate summary: invalid transcript";
    }
    if (!videoTitle || typeof videoTitle !== 'string') {
        return "Unable to generate summary: invalid video title";
    }
    // Create a more comprehensive summary
    const words = transcript.split(' ');
    const transcriptLength = words.length;
    // Adaptive target length based on transcript size
    let targetLength;
    if (transcriptLength < 500) {
        targetLength = Math.floor(transcriptLength * 0.4); // 40% for short transcripts
    }
    else if (transcriptLength < 2000) {
        targetLength = Math.min(400, Math.floor(transcriptLength * 0.3)); // 30% or 400 words max
    }
    else {
        targetLength = Math.min(500, Math.floor(transcriptLength * 0.2)); // 20% or 500 words max for very long transcripts
    }
    const sentences = transcript.split('.').filter(s => s.trim().length > 10);
    // Take sentences from beginning, middle, and end for balanced summary
    const beginning = sentences.slice(0, Math.ceil(sentences.length * 0.2));
    const middleStart = Math.floor(sentences.length * 0.4);
    const middle = sentences.slice(middleStart, middleStart + Math.ceil(sentences.length * 0.3));
    const end = sentences.slice(-Math.ceil(sentences.length * 0.2));
    const summarySentences = [...beginning, ...middle, ...end]
        .map(s => s.trim())
        .filter(s => s.length > 0);
    let summary = summarySentences.join('. ').trim();
    // Truncate to target length
    if (summary.length > targetLength * 5) { // rough word count
        const summaryWords = summary.split(' ').slice(0, targetLength);
        summary = summaryWords.join(' ');
        if (!summary.endsWith('.')) {
            summary += '...';
        }
    }
    return `## Summary\n\n${summary}`;
}
function generateGuidedSummary(transcript, videoTitle, guidance) {
    // Validate inputs
    if (!transcript || typeof transcript !== 'string') {
        return "Unable to generate summary: invalid transcript";
    }
    if (!videoTitle || typeof videoTitle !== 'string') {
        return "Unable to generate summary: invalid video title";
    }
    if (!guidance || typeof guidance !== 'string') {
        return "Unable to generate summary: invalid guidance";
    }
    // Generate summary based on user guidance
    const guidanceLower = guidance.toLowerCase();
    if (guidanceLower.includes('brief') || guidanceLower.includes('short') || guidanceLower.includes('overview')) {
        return generateKeyPointsSummary(transcript, videoTitle);
    }
    else if (guidanceLower.includes('detailed') || guidanceLower.includes('comprehensive') || guidanceLower.includes('analysis')) {
        return generateDetailedSummary(transcript, videoTitle);
    }
    else if (guidanceLower.includes('key') || guidanceLower.includes('points') || guidanceLower.includes('bullet')) {
        return generateKeyPointsSummary(transcript, videoTitle);
    }
    else {
        // Try to incorporate guidance into the summary
        const baseSummary = generateDetailedSummary(transcript, videoTitle);
        return `## Summary (Based on: ${guidance})\n\n${baseSummary}`;
    }
}
export default tool({
    description: "Summarize YouTube video transcripts with optional guidance",
    args: {
        transcript: tool.schema.string().describe("Full video transcript to summarize"),
        video_title: tool.schema.string().describe("Title of the video for context"),
        summary_guidance: tool.schema.string().optional().describe("Optional guidance for summary style (e.g., 'brief overview', 'detailed analysis', 'key points only')")
    },
    async execute(args, context) {
        try {
            const { transcript, video_title, summary_guidance } = args;
            // Handle empty or unavailable transcript
            if (!transcript || transcript.trim() === '' ||
                transcript.includes("No transcript available for this video")) {
                const result = {
                    summary: "No transcript available for this video. The video may not have captions or they may not be accessible through the public API.",
                    summary_type: "unavailable"
                };
                return JSON.stringify(result);
            }
            let summary;
            let summaryType;
            if (summary_guidance) {
                summary = generateGuidedSummary(transcript, video_title, summary_guidance);
                summaryType = "guided";
            }
            else {
                // Default to key points
                summary = generateKeyPointsSummary(transcript, video_title);
                summaryType = "key_points";
            }
            const result = {
                summary,
                summary_type: summaryType
            };
            return JSON.stringify(result);
        }
        catch (error) {
            throw new Error(`Transcript summarizer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },
});
