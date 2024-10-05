from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)

@app.route("/transcript", methods=['GET'])
def getTranscript():

  #video_id = "NtfbWkxJTHw"
  video_id = request.args.get('video_id', type=str)
  if not video_id:
    return jsonify({
      "error": "No VideoID"
    }), 400 # 400 means invalid
  
  try: 
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    transcriptText = []
    for item in transcript:
      transcriptText.append(item['text'])
    
    return jsonify(transcriptText), 200 #200 means response ok
  
  except Exception as e:
    return jsonify({"error": str(e)}), 500 # Handle errors
  
if __name__ == "__main__":
  app.run(debug=True, port=8080)