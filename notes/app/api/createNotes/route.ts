import { NextResponse } from "next/server";

async function fetchTranscript(url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

  const response = await fetch(`${baseUrl}/transcript`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP status ${response.status}`);
  }

  return response;
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
    const response = await fetchTranscript(url);

    // Return the streaming response from the backend
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
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
