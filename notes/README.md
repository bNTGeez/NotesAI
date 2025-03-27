# NotesAI

A powerful AI-powered note-taking application that automatically generates detailed, structured notes from YouTube videos. Built with Next.js, Flask, and OpenAI's GPT-4 Turbo.

> ⚠️ **Important**: This application requires OpenAI API credits to function.
>
> - The application uses GPT-4 Turbo

## Features

🎥 **YouTube Integration**

- Extract transcripts from any YouTube video
- Support for various YouTube URL formats
- Real-time transcript processing

📝 **Smart Note Generation**

- AI-powered note creation
- Structured formatting
- Clear section organization

🔍 **Topic Organization**

- Automatic content breakdown
- Clear section hierarchy
- Logical flow between topics

📚 **Detailed Breakdown**

- Comprehensive topic coverage
- Subtopic organization
- Key point highlighting

🎯 **Key Takeaways**

- Important point extraction
- Practical applications
- Main concepts summary

📱 **Modern UI**

- Clean, responsive design
- Material-UI components
- Tailwind CSS styling

⚡ **Real-time Processing**

- Instant note generation
- Streaming responses
- Progress indication

🔒 **Secure API**

- Protected endpoints
- Error handling
- Rate limiting

## Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Material-UI
- Tailwind CSS
- OpenAI API

### Backend

- Flask (Python)
- YouTube Transcript API
- CORS support
- Gunicorn (Production)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- OpenAI API key
- YouTube API key (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notesai.git
cd notesai
```

2. Install frontend dependencies:

```bash
cd notes
npm install
```

3. Install backend dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
# .env
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=your_openai_api_key
```

### Running Locally

1. Start the backend server:

```bash
cd backend
python youtube.py
```

2. Start the frontend development server:

```bash
cd notes
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Paste a YouTube URL into the input field
2. Click "Generate Notes"
3. Wait for the AI to process the video transcript
4. View your structured notes with:
   - Main topics overview
   - Detailed topic breakdown
   - Key takeaways
   - Additional notes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or support, email me at tangbenjamin123@gmail.com
