from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import youtube_dl
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
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  
        logger.info(f"Testing transcript retrieval for URL: {test_url}")
        
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'skip_download': True,
            'quiet': True
        }
        
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(test_url, download=False)
            if 'subtitles' in info or 'automatic_captions' in info:
                return jsonify({"status": "success", "message": "YouTube transcript API is working!"})
            else:
                return jsonify({"status": "error", "message": "No subtitles found"}), 500
                
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
            # Configure youtube-dl options
            ydl_opts = {
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en'],
                'skip_download': True,
                'quiet': True
            }
            
            # Extract video info and subtitles
            with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Check for available subtitles
                if 'subtitles' not in info and 'automatic_captions' not in info:
                    return jsonify({
                        "error": "No subtitles available",
                        "details": "This video doesn't have any subtitles or captions available. Please try a different video."
                    }), 400
                
                # Get the transcript text
                transcript_text = ""
                if 'subtitles' in info and 'en' in info['subtitles']:
                    # Try manual subtitles first
                    transcript_url = info['subtitles']['en'][0]['url']
                    response = httpx.get(transcript_url)
                    transcript_text = response.text
                elif 'automatic_captions' in info and 'en' in info['automatic_captions']:
                    # Fall back to auto-generated captions
                    transcript_url = info['automatic_captions']['en'][0]['url']
                    response = httpx.get(transcript_url)
                    transcript_text = response.text
                else:
                    return jsonify({
                        "error": "No English subtitles available",
                        "details": "This video doesn't have English subtitles or captions. Please try a different video."
                    }), 400
            
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