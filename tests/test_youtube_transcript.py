"""Test suite for YouTube transcript tool."""

import json
import os

# Add the tool directory to the path
import sys
from unittest.mock import Mock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".opencode", "tool"))

from youtube_transcript import (
    execute,
    get_youtube_metadata,
    get_youtube_transcript,
    validate_youtube_video_id,
)


class TestValidateYouTubeVideoId:
    """Test video ID validation."""

    def test_valid_video_id(self):
        """Test valid video IDs."""
        valid_ids = [
            "dQw4w9WgXcQ",
            "a1b2c3d4e5f",
            "12345678901",
            "abc-def_ghi",
        ]

        for video_id in valid_ids:
            validate_youtube_video_id(video_id)  # Should not raise


def test_invalid_video_id(self):
    """Test invalid video IDs."""
    invalid_ids = [
        "short",
        "toolong123456",
        "invalid@chars",
        "with spaces",
        "with.dots",
    ]

    for video_id in invalid_ids:
        with pytest.raises(ValueError, match="Invalid YouTube video ID format"):
            validate_youtube_video_id(video_id)

    # Test empty string separately
    with pytest.raises(ValueError, match="Video ID must be a non-empty string"):
        validate_youtube_video_id("")

    # Test None separately
    with pytest.raises(ValueError, match="Video ID must be a non-empty string"):
        validate_youtube_video_id(None)


class TestGetYouTubeTranscript:
    """Test transcript fetching."""

    def test_transcript_success(self):
        """Test successful transcript fetching."""
        with patch("youtube_transcript.YouTubeTranscriptApi.fetch") as mock_get:
            mock_get.return_value = [
                {"text": "Hello world", "start": 0.0, "duration": 1.0},
                {"text": "This is a test", "start": 1.0, "duration": 2.0},
            ]

            result = get_youtube_transcript("dQw4w9WgXcQ")
            assert result == "Hello world This is a test"

    def test_transcript_no_segments(self):
        """Test transcript with no segments."""
        with patch("youtube_transcript.YouTubeTranscriptApi.fetch") as mock_get:
            mock_get.return_value = []

            with pytest.raises(Exception, match="No transcript available"):
                get_youtube_transcript("dQw4w9WgXcQ")

    def test_transcript_disabled(self):
        """Test transcript disabled error."""
        from youtube_transcript_api._errors import TranscriptsDisabled

        with patch("youtube_transcript.YouTubeTranscriptApi.fetch") as mock_get:
            mock_get.side_effect = TranscriptsDisabled("Transcripts disabled")

            with pytest.raises(Exception, match="No transcript available"):
                get_youtube_transcript("dQw4w9WgXcQ")

    def test_transcript_language_fallback(self):
        """Test transcript language fallback."""
        from youtube_transcript_api._errors import NoTranscriptFound

        with patch("youtube_transcript.YouTubeTranscriptApi.fetch") as mock_get:
            # First call raises NoTranscriptFound, second call succeeds
            mock_get.side_effect = [
                NoTranscriptFound("No English transcript"),
                [{"text": "Fallback transcript", "start": 0.0, "duration": 1.0}],
            ]

            result = get_youtube_transcript("dQw4w9WgXcQ")
            assert result == "Fallback transcript"


class TestGetYouTubeMetadata:
    """Test metadata fetching."""

    def test_metadata_success(self, youtube_api_key):
        """Test successful metadata fetching."""
        mock_response = Mock()
        mock_response.json.return_value = {
            "items": [
                {
                    "snippet": {
                        "title": "Test Video Title",
                        "description": "Test video description",
                    }
                }
            ]
        }

        with patch("youtube_transcript.requests.get") as mock_get:
            mock_get.return_value = mock_response

            result = get_youtube_metadata("dQw4w9WgXcQ")
            assert result["title"] == "Test Video Title"
            assert result["description"] == "Test video description"

    def test_metadata_no_api_key(self):
        """Test metadata fetching without API key."""
        with patch.dict(os.environ, {"YOUTUBE_API_KEY": ""}):
            with pytest.raises(
                Exception, match="YOUTUBE_API_KEY environment variable not set"
            ):
                get_youtube_metadata("dQw4w9WgXcQ")

    def test_metadata_video_not_found(self, youtube_api_key):
        """Test metadata fetching for non-existent video."""
        mock_response = Mock()
        mock_response.json.return_value = {"items": []}

        with patch("youtube_transcript.requests.get") as mock_get:
            mock_get.return_value = mock_response

            with pytest.raises(Exception, match="Video not found"):
                get_youtube_metadata("dQw4w9WgXcQ")  # Use valid ID format

    def test_metadata_api_error(self, youtube_api_key):
        """Test metadata fetching with API error."""
        with patch("youtube_transcript.requests.get") as mock_get:
            mock_get.side_effect = Exception("Network error")

            with pytest.raises(Exception, match="Failed to get metadata"):
                get_youtube_metadata("dQw4w9WgXcQ")


class TestExecute:
    """Test main execute function."""

    def test_execute_success(self, youtube_api_key):
        """Test successful execution."""
        mock_metadata = {"title": "Test Video", "description": "Test Description"}
        mock_transcript = "Test transcript content"

        with (
            patch("youtube_transcript.get_youtube_metadata") as mock_meta,
            patch("youtube_transcript.get_youtube_transcript") as mock_trans,
        ):
            mock_meta.return_value = mock_metadata
            mock_trans.return_value = mock_transcript

            result = execute({"video_id": "dQw4w9WgXcQ"})

            parsed_result = json.loads(result)
            assert parsed_result["video_id"] == "dQw4w9WgXcQ"
            assert parsed_result["title"] == "Test Video"
            assert parsed_result["transcript"] == "Test transcript content"
            assert parsed_result["description"] == "Test Description"

    def test_execute_no_api_key(self):
        """Test execution without API key."""
        with patch.dict(os.environ, {"YOUTUBE_API_KEY": ""}):
            with pytest.raises(
                Exception, match="YOUTUBE_API_KEY environment variable not set"
            ):
                execute({"video_id": "dQw4w9WgXcQ"})

    def test_execute_no_video_id(self, youtube_api_key):
        """Test execution without video ID."""
        with pytest.raises(Exception, match="video_id argument is required"):
            execute({})

    def test_execute_tool_failure(self, youtube_api_key):
        """Test execution with tool failure."""
        with patch("youtube_transcript.get_youtube_metadata") as mock_meta:
            mock_meta.side_effect = Exception("Tool error")

            with pytest.raises(Exception, match="YouTube tool failed"):
                execute({"video_id": "dQw4w9WgXcQ"})
