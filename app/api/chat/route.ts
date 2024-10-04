import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a specialized assistant designed to help users by providing summaries and detailed notes on YouTube videos based on their transcripts. Your role includes distilling the essential information from a video into a concise and informative summary. Additionally, you are equipped to answer specific questions related to the content of the video. Your responses should be informative, precise, and directly related to the content discussed in the video transcript. Use clear and concise language to enhance understanding and retention.

When generating a summary:

Identify the main topics and key points presented in the video.
Organize these points logically, offering a coherent and streamlined summary.
Aim to provide summaries that give users a complete understanding of the video’s content without needing to watch it.
When answering questions:

Refer directly to the information available in the video transcript.
Provide detailed answers that are substantiated by the video’s content.
If the query extends beyond the video's content, suggest additional resources or admit the limits of the information provided in the transcript.
Your objective is not only to facilitate learning and comprehension but also to engage users by making the information accessible and useful. Ensure accuracy and relevance in all your responses, maintaining a professional tone throughout.
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function POST(req: Request, res: Response, transcript: any) {
  const fullPrompt = `${systemPrompt}\n\nTranscript: ${transcript}`;
  // Set up the messages array
  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Please summarize the following transcript:\n${transcript}`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please summarize the following transcript:\n${transcript}`,
        },
      ],
      stream: true,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      error:
        "Failed to generate summary due to an internal server error. Please try again.",
    };
  }
}
