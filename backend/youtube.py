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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000",
        "https://notes-ai-three.vercel.app",
        "https://notesai-nywa.onrender.com"
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
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates concise, well-structured notes from YouTube video transcripts. Focus on key points, main ideas, and important details. Format the notes with clear sections and bullet points."},
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
            if "Subtitles are disabled" in error_message:
                return jsonify({
                    "error": "This video has subtitles disabled. Please try a different video or enable subtitles on YouTube.",
                    "details": "To enable subtitles on YouTube:\n1. Click the CC button in the video player\n2. Select 'English' or your preferred language\n3. If no subtitles are available, you can request them from the video owner"
                }), 400
            elif "No transcript" in error_message:
                return jsonify({
                    "error": "This video has no transcript available",
                    "details": "Please try a different video or enable subtitles on YouTube"
                }), 400
            elif "Video unavailable" in error_message:
                return jsonify({
                    "error": "This video is unavailable or private",
                    "details": "Make sure the video is public and accessible"
                }), 400
            else:
                return jsonify({
                    "error": "Failed to get transcript",
                    "details": error_message
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