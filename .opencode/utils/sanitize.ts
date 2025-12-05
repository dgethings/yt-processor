/**
 * Sanitize a video title for use in filenames and display
 */
export function sanitizeTitle(title: string): string {
  return title
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/:/g, '-')
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .trim()
}