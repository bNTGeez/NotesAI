from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import re
import os

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "notes-ai-three.vercel.app"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

def extract_video_id(url):
    # different YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)',  # Standard and shortened URLs
        r'youtube\.com\/embed\/([^&\n?]+)',  # Embed URLs
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

@app.route("/transcript", methods=['POST'])
def getTranscript():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({"error": "Please provide a YouTube URL"}), 400
        
        url = data['url']
        if not url:
            return jsonify({"error": "URL cannot be empty"}), 400

        # Try to extract video ID from URL
        video_id = extract_video_id(url)
        if not video_id:
            return jsonify({"error": "Invalid YouTube URL format"}), 400

        # Get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        notes = [item['text'] for item in transcript]
        return jsonify(notes), 200

    except Exception as e:
        error_message = str(e)
        if "No transcript" in error_message:
            return jsonify({"error": "This video has no transcript available"}), 400
        elif "Video unavailable" in error_message:
            return jsonify({"error": "This video is unavailable or private"}), 400
        else:
            return jsonify({"error": f"Error getting transcript: {error_message}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)