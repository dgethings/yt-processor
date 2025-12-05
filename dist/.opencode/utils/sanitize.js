/**
 * Sanitize a video title for use in filenames and display
 */
export function sanitizeTitle(title) {
    return title
        .normalize('NFC') // Normalize Unicode characters
        .replace(/^\[/, '') // Remove leading brackets
        .replace(/\]$/, '') // Remove trailing brackets
        .replace(/:/g, '-') // Replace colons with hyphens
        .replace(/[<>:"/\\|?*\x00-\x1f\x7f-\x9f]/g, '') // Remove invalid filename chars and control chars
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis (basic set)
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove symbols & pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport & map symbols
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove flags
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
        .replace(/[\u{2000}-\u{206F}]/gu, '') // Remove general punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 100); // Limit length to 100 chars for filesystem compatibility
}
