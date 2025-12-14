#!/usr/bin/env python3
"""Test script for YouTube processor agents (using OpenCode CLI).

This script tests the Python implementation of the YouTube processor agents
and tools, mirroring the functionality of the original test-agents.js.
"""

import json
import os
import subprocess
import sys
from typing import Dict, Any, Optional


def run_opencode_agent(agent: str, message: str) -> str:
    """Run an OpenCode agent and return the result.

    Args:
        agent: Agent name to run
        message: Message to send to agent

    Returns:
        Agent output as string
    """
    try:
        result = subprocess.run(
            ["opencode", "run", "--agent", agent, message],
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        return e.stdout or e.stderr
    except subprocess.TimeoutExpired:
        return "Agent execution timed out"
    except FileNotFoundError:
        return (
            "OpenCode CLI not found. Please ensure opencode is installed and in PATH."
        )


def test_youtube_transcript_tool() -> Optional[Dict[str, Any]]:
    """Test the YouTube transcript tool directly.

    Returns:
        Test result dictionary or None if failed
    """
    print("Testing YouTube transcript tool...")

    try:
        # Import and test the Python tool directly
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".opencode", "tool"))
        from youtube_transcript import execute

        result = execute({"video_id": "dQw4w9WgXcQ"})
        parsed_result = json.loads(result)

        print("✅ YouTube transcript tool works")
        print("Result keys:", list(parsed_result.keys()))
        return parsed_result

    except Exception as e:
        print(f"❌ YouTube transcript tool failed: {e}")
        return None


def test_transcript_summarizer() -> Optional[Dict[str, Any]]:
    """Test the transcript summarizer agent.

    Returns:
        Test result dictionary or None if failed
    """
    print("\nTesting transcript summarizer...")

    try:
        test_transcript = (
            "This is a test transcript. It contains multiple sentences. "
            "The main point is to test the summarization functionality. "
            "Key points include testing the system, ensuring it works correctly, "
            "and validating the output."
        )
        message = f"transcript: {test_transcript} video_title: Test Video"
        result = run_opencode_agent("transcript-summarizer", message)

        # Check if result contains expected JSON structure
        if (
            '"summary_type": "key_points"' in result
            or '"summary_type": "detailed"' in result
        ):
            print("✅ Transcript summarizer works")
            print("Result contains expected JSON structure")
            return {"success": True, "output": result}
        else:
            print("❌ Transcript summarizer failed: unexpected output")
            print("Output:", result[:500])
            return None

    except Exception as e:
        print(f"❌ Transcript summarizer failed: {e}")
        return None


def test_youtube_processor() -> Optional[Dict[str, Any]]:
    """Test the YouTube processor agent.

    Returns:
        Test result dictionary or None if failed
    """
    print("\nTesting YouTube processor agent...")

    try:
        message = "youtube_input: dQw4w9WgXcQ user_comments: This is a test comment"
        result = run_opencode_agent("youtube-processor", message)

        if (
            "Obsidian" in result
            or "markdown" in result
            or "Successfully saved" in result
        ):
            print("✅ YouTube processor works")
            print("Agent generated markdown output")
            return {"success": True, "output": result}
        else:
            print("❌ YouTube processor failed: unexpected output")
            print("Output:", result[:500])
            return None

    except Exception as e:
        print(f"❌ YouTube processor failed: {e}")
        return None


def check_youtube_api_key() -> bool:
    """Check if YouTube API key is set.

    Returns:
        True if API key is set, False otherwise
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        print("❌ YOUTUBE_API_KEY environment variable not set.")
        print("   Please obtain a YouTube Data API v3 key from Google Cloud Console")
        print('   and set it with: export YOUTUBE_API_KEY="your_api_key"')
        return False
    return True


def run_tests() -> None:
    """Run all tests and report results."""
    print("🧪 Running YouTube Processor Agent Tests (Python Implementation)\n")

    # Check if YouTube API key is set
    api_key_available = check_youtube_api_key()

    # Run tests
    transcript_result = test_youtube_transcript_tool()
    summarizer_result = test_transcript_summarizer()
    processor_result = test_youtube_processor()

    # Report results
    print("\n📊 Test Summary:")
    print("YouTube Transcript Tool:", "✅" if transcript_result else "❌")
    print("Transcript Summarizer:", "✅" if summarizer_result else "❌")
    print("YouTube Processor:", "✅" if processor_result else "❌")

    # Additional info
    if not api_key_available:
        print("\n⚠️  Some tests may fail without YOUTUBE_API_KEY")
        print("   Set the environment variable to run full integration tests")

    # Overall result
    all_passed = all([transcript_result, summarizer_result, processor_result])

    if all_passed:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
