import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a specialized note-taking assistant that creates detailed, well-structured notes from YouTube video transcripts. Your goal is to break down complex topics into clear, organized sections that are easy to understand and reference.

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
- Organize information in a hierarchical structure
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// truncate transcript to fit within token limit
function truncateTranscript(
  transcript: string[],
  maxTokens: number = 6000
): string {
  const maxChars = maxTokens * 4;
  let totalChars = 0;
  const truncatedTranscript: string[] = [];

  for (const line of transcript) {
    if (totalChars + line.length > maxChars) {
      break;
    }
    truncatedTranscript.push(line);
    totalChars += line.length;
  }

  return truncatedTranscript.join(" ");
}

async function fetchTranscript(url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

  const response = await fetch(`${baseUrl}/transcript`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP status ${response.status}`);
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Please provide a YouTube URL" },
        { status: 400 }
      );
    }

    // Get transcript from Flask backend
    const transcriptData = await fetchTranscript(url);

    // Truncate transcript to fit within token limit
    const truncatedTranscript = truncateTranscript(transcriptData);

    // Generate completion using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please summarize the following transcript:\n${truncatedTranscript}`,
        },
      ],
      stream: true,
      max_tokens: 1500,
    });

    let generatedText = "";
    for await (const chunk of completion) {
      generatedText += chunk.choices[0]?.delta?.content || "";
    }

    return NextResponse.json(generatedText, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
