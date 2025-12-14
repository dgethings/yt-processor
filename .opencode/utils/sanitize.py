"""Utility functions for sanitizing YouTube video titles.

This module provides functions to sanitize video titles for safe use in filenames
and display, matching the behavior of the original TypeScript implementation.
"""

import re
import unicodedata


def sanitize_title(title: str) -> str:
    """Sanitize a video title for use in filenames and display.

    This function performs the exact same sanitization steps as the original
    TypeScript implementation to ensure consistency.

    Args:
        title: Raw video title from YouTube

    Returns:
        Sanitized title safe for filesystem use

    Examples:
        >>> sanitize_title("Never Gonna Give You Up [Official Video]")
        'Never Gonna Give You Up Official Video'

        >>> sanitize_title("Video: With Special <Characters>")
        'Video- With Special Characters'
    """
    # Normalize Unicode characters (NFC)
    title = unicodedata.normalize("NFC", title)

    # Remove leading brackets [
    title = title.replace("[", "")

    # Remove trailing brackets ]
    title = title.replace("]", "")

    # Replace colons with hyphens
    title = title.replace(":", "-")

    # Remove invalid filename chars and control chars
    # Pattern matches: < > : " / \ | ? * and control characters
    title = re.sub(r'[<>:"/\\|?*\x00-\x1f\x7f-\x9f]', "", title)

    # Remove emojis (basic set)
    title = re.sub(r"[\U0001F600-\U0001F64F]", "", title)

    # Remove symbols & pictographs
    title = re.sub(r"[\U0001F300-\U0001F5FF]", "", title)

    # Remove transport & map symbols
    title = re.sub(r"[\U0001F680-\U0001F6FF]", "", title)

    # Remove flags
    title = re.sub(r"[\U0001F1E0-\U0001F1FF]", "", title)

    # Remove misc symbols
    title = re.sub(r"[\u2600-\u26FF]", "", title)

    # Remove general punctuation
    title = re.sub(r"[\u2000-\u206F]", "", title)

    # Normalize whitespace (collapse to single spaces)
    title = re.sub(r"\s+", " ", title)

    # Trim whitespace
    title = title.strip()

    # Limit length to 100 characters for filesystem compatibility
    title = title[:100]

    return title


def is_safe_filename(title: str) -> bool:
    """Check if a title is safe for use as a filename.

    Args:
        title: Title to check

    Returns:
        True if title is safe, False otherwise
    """
    # Check for invalid filename characters
    if re.search(r'[<>:"/\\|?*\x00-\x1f\x7f-\x9f]', title):
        return False

    # Check for reserved names (Windows)
    reserved_names = {
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT3",
        "LPT4",
        "LPT5",
        "LPT6",
        "LPT7",
        "LPT8",
        "LPT9",
    }

    if title.upper() in reserved_names:
        return False

    return True


def create_safe_filename(title: str, extension: str = ".md") -> str:
    """Create a safe filename from a title.

    Args:
        title: Video title to convert
        extension: File extension to append (default: .md)

    Returns:
        Safe filename with extension
    """
    sanitized = sanitize_title(title)

    # Ensure we have a valid filename (empty or just whitespace/hyphens)
    if not sanitized or sanitized.strip("-_ ") == "":
        sanitized = "untitled"

    # Add extension
    if not extension.startswith("."):
        extension = "." + extension

    return sanitized + extension


# For direct testing
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python sanitize.py <title>")
        sys.exit(1)

    title = " ".join(sys.argv[1:])
    print(f"Original: {title}")
    print(f"Sanitized: {sanitize_title(title)}")
    print(f"Safe filename: {create_safe_filename(title)}")
