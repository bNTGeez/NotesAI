from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import re
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import httpx
import logging
import time
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NOTE_TAKING_PROMPT = """You are a specialized note-taking assistant that creates detailed, well-structured notes from YouTube video transcripts. Your goal is to break down complex topics into clear, organized sections that are easy to understand and reference.

When creating notes, follow this structure:

1. Main Topics Overview
   - List the main topics covered in the video
   - Provide a brief 2-3 sentence summary of each topic

2. Detailed Topic Breakdown
   For each main topic:
   - Topic Name
     • Key Points
     • Supporting Details
     • Examples or Case Studies (if any)
     • Important Definitions or Concepts
     • Related Subtopics

3. Key Takeaways
   - List the most important points to remember
   - Highlight any practical applications or implications

4. Additional Notes
   - Important dates, numbers, or statistics mentioned
   - References to other resources or related topics
   - Any warnings, cautions, or important considerations

Format your response using clear headings, bullet points, and proper spacing to make it easy to read and navigate. Use markdown formatting for better readability.

Remember to:
- Break down complex concepts into simpler terms
- Include specific examples when provided in the video
- Maintain a logical flow between topics
- Highlight important terms or concepts
- Use clear, concise language
- Organize information in a hierarchical structure"""

load_dotenv()

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000",
        "https://notes-ai-three.vercel.app",
        "notesai-production.up.railway.app"  
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize OpenAI client without proxy settings
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.Client()
)

def extract_video_id(url):
    # Handle YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?]+)',
        r'youtube\.com\/shorts\/([^&\n?]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)  # gets video id
            logger.info(f"Successfully extracted video ID: {video_id} from URL: {url}")
            return video_id
    logger.error(f"Failed to extract video ID from URL: {url}")
    return None

@app.route("/test", methods=['GET'])
def test():
    """Simple test route to check YouTube transcript API"""
    try:
        # Try a video with auto-generated captions
        test_video_id = "jNQXAC9IVRw"  # "Me at the zoo" - first YouTube video ever
        logger.info(f"Testing transcript retrieval for video ID: {test_video_id}")
        
        # Get the transcript directly
        transcript = YouTubeTranscriptApi.get_transcript(test_video_id)
        logger.info(f"Successfully retrieved transcript with {len(transcript)} entries")
        
        return jsonify({"status": "success", "message": "YouTube transcript API is working!"})
                
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/transcript", methods=['POST'])
def getTranscript():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "No URL provided"}), 400
            
        video_id = extract_video_id(url)
        
        if not video_id:
            return jsonify({"error": "Invalid YouTube URL"}), 400
            
        try:
            # Get the transcript directly
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
            logger.info(f"Successfully retrieved transcript with {len(transcript_data)} entries")
            
            # puts all transcript text into one string
            transcript_text = ' '.join([entry['text'] for entry in transcript_data])
            
            # Generate notes using OpenAI
            stream = client.chat.completions.create(
                model="gpt-4-0125-preview",
                messages=[
                    {"role": "system", "content": NOTE_TAKING_PROMPT},
                    {"role": "user", "content": f"Please create detailed notes from this transcript:\n\n{transcript_text}"}
                ],
                temperature=0.7,
                stream=True
            )

            """Stream the generated notes in real-time."""
            def generate_streaming_response():
                for chunk in stream:
                    # Get the new text content (if any)
                    new_text = chunk.choices[0].delta.content

                    if new_text is not None:
                        message = json.dumps({'content': new_text})
                        yield f"data: {message}\n\n"
                
                # Signal to the client that streaming is complete
                yield "data: [DONE]\n\n"
            
            # Return a streaming response to the client
            return Response(generate_streaming_response(), mimetype="text/event-stream")
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Error getting transcript: {error_message}")
            
            # Enhanced error messages for different scenarios
            if "Subtitles are disabled" in error_message:
                return jsonify({
                    "error": "Unable to access video subtitles",
                    "details": "This could be due to regional restrictions or YouTube's security measures. Please try:\n1. Using a different video\n2. Checking if the video has captions enabled on YouTube\n3. Waiting a few minutes and trying again"
                }), 400
            elif "No transcript" in error_message:
                return jsonify({
                    "error": "No transcript available",
                    "details": "This video doesn't have any captions or transcripts available. Please try a different video."
                }), 400
            elif "Video unavailable" in error_message:
                return jsonify({
                    "error": "Video unavailable",
                    "details": "This video might be private, restricted, or no longer available. Please try a different video."
                }), 400
            elif "Too many requests" in error_message.lower():
                return jsonify({
                    "error": "Rate limit exceeded",
                    "details": "YouTube is temporarily limiting access. Please wait a few minutes and try again."
                }), 429
            else:
                return jsonify({
                    "error": "Failed to get transcript",
                    "details": f"An error occurred while trying to get the transcript. Please try again later. Error: {error_message}"
                }), 500
                
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)