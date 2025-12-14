"""Test suite for sanitize utility."""

import os
import sys

# Add utils directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".opencode", "utils"))

from sanitize import create_safe_filename, is_safe_filename, sanitize_title


class TestSanitizeTitle:
    """Test title sanitization."""

    def test_basic_sanitization(self):
        """Test basic title sanitization."""
        title = "Never Gonna Give You Up [Official Video]"
        result = sanitize_title(title)
        assert result == "Never Gonna Give You Up Official Video"

    def test_colon_replacement(self):
        """Test colon replacement with hyphens."""
        title = "Video: With Multiple: Colons"
        result = sanitize_title(title)
        assert result == "Video- With Multiple- Colons"

    def test_special_character_removal(self):
        """Test removal of special characters."""
        title = 'Video <With> Special "Characters" /\\|?*'
        result = sanitize_title(title)
        assert result == "Video With Special Characters"

    def test_emoji_removal(self):
        """Test emoji removal."""
        title = "Video with emojis 😊🎉🚀"
        result = sanitize_title(title)
        assert result == "Video with emojis"

    def test_whitespace_normalization(self):
        """Test whitespace normalization."""
        title = "Video    with     multiple    spaces"
        result = sanitize_title(title)
        assert result == "Video with multiple spaces"

    def test_length_limiting(self):
        """Test length limiting to 100 characters."""
        title = "A" * 150
        result = sanitize_title(title)
        assert len(result) == 100

    def test_unicode_normalization(self):
        """Test Unicode normalization."""
        title = "Video with café and résumé"
        result = sanitize_title(title)
        assert "café" in result and "résumé" in result

    def test_empty_title(self):
        """Test empty title handling."""
        result = sanitize_title("")
        assert result == ""

    def test_only_brackets(self):
        """Test title with only brackets."""
        title = "[[Test]]"
        result = sanitize_title(title)
        assert result == "Test"

    def test_control_characters(self):
        """Test control character removal."""
        title = "Video\x00with\x1fcontrol\x7fcharacters"
        result = sanitize_title(title)
        assert result == "Videowithcontrolcharacters"


class TestIsSafeFilename:
    """Test filename safety checking."""

    def test_safe_filenames(self):
        """Test safe filenames."""
        safe_names = [
            "normal_filename",
            "file-with-hyphens",
            "file_with_underscores",
            "File123",
        ]

        for name in safe_names:
            assert is_safe_filename(name), f"{name} should be safe"

    def test_unsafe_filenames(self):
        """Test unsafe filenames."""
        unsafe_names = [
            "file<with>brackets",
            "file:with:colons",
            "file/with/slashes",
            "file\\with\\backslashes",
            "file|with|pipes",
            "file?with?questions",
            "file*with*asterisks",
            'file"with"quotes',
            "CON",  # Windows reserved
            "PRN",  # Windows reserved
            "AUX",  # Windows reserved
        ]

        for name in unsafe_names:
            assert not is_safe_filename(name), f"{name} should be unsafe"

    def test_case_insensitive_reserved_names(self):
        """Test case-insensitive reserved name checking."""
        reserved_variants = ["con", "Con", "CON", "prn", "PRN", "aux", "AUX"]

        for name in reserved_variants:
            assert not is_safe_filename(name), f"{name} should be unsafe (reserved)"


class TestCreateSafeFilename:
    """Test safe filename creation."""

    def test_basic_filename_creation(self):
        """Test basic filename creation."""
        result = create_safe_filename("Test Video")
        assert result == "Test Video.md"

    def test_custom_extension(self):
        """Test custom extension."""
        result = create_safe_filename("Test Video", ".txt")
        assert result == "Test Video.txt"

    def test_extension_without_dot(self):
        """Test extension without dot."""
        result = create_safe_filename("Test Video", "txt")
        assert result == "Test Video.txt"

    def test_empty_sanitized_title(self):
        """Test empty sanitized title."""
        result = create_safe_filename('[]<>:"/\\|?*')
        assert result == "untitled.md"

    def test_long_title_truncation(self):
        """Test long title truncation."""
        long_title = "A" * 150
        result = create_safe_filename(long_title)
        assert len(result) <= 104  # 100 chars + ".md"

    def test_special_characters_in_filename(self):
        """Test special characters in filename."""
        result = create_safe_filename("Video: With <Special> Characters")
        assert result == "Video- With Special Characters.md"
