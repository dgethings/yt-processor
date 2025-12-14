"""Pytest configuration for yt-processor tests."""

import os

import pytest


@pytest.fixture
def youtube_api_key() -> str:
    """Fixture to get YouTube API key from environment."""
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        pytest.skip("YOUTUBE_API_KEY environment variable not set")
    return api_key


@pytest.fixture
def test_video_id() -> str:
    """Fixture providing a test video ID."""
    return "dQw4w9WgXcQ"  # Rick Astley - Never Gonna Give You Up


@pytest.fixture
def test_transcript_data() -> str:
    """Fixture providing sample transcript data for testing."""
    return """This is a sample transcript for testing purposes.
    It contains multiple sentences and paragraphs.
    The transcript should be properly formatted and contain
    various punctuation marks and special characters.
    This allows us to test the transcript processing functionality
    without making actual API calls during unit tests."""


@pytest.fixture
def debug_mode() -> bool:
    """Fixture to check if debug mode is enabled."""
    return os.getenv("DEBUG") == "yt-processor"
