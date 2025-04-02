"use client";
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CreateNotes() {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState(false);

  // avoid CORS issues
  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "https://notesai-production.up.railway.app";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError("");
    setNotes("");
    setStreaming(false);

    try {
      const response = await fetch(`${apiUrl}/transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;

        // Enhanced error messages
        if (response.status === 429) {
          errorMessage =
            "YouTube rate limit reached. Please try again in a few minutes.";
        } else if (errorMessage.includes("no transcript")) {
          errorMessage =
            "This video doesn't have captions/transcript available. Please try another video.";
        }

        throw new Error(errorMessage);
      }

      // Check if the response is a stream
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("text/event-stream")) {
        // Handle streaming response
        setStreaming(true);
        const reader = response.body?.getReader();
        let accumulatedNotes = "";

        if (!reader) {
          throw new Error("Stream reader is not available");
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6);

              if (data === "[DONE]") {
                continue;
              }

              try {
                const parsedData = JSON.parse(data);
                if (parsedData.content) {
                  accumulatedNotes += parsedData.content;
                  setNotes(accumulatedNotes);
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.notes) {
          throw new Error("No notes received from server");
        }

        setNotes(data.notes);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "background.default",
        pt: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Generate Notes from YouTube Video
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="YouTube URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              sx={{ mb: 2 }}
              error={!!error}
              helperText={error}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              {loading ? "Generating..." : "Generate Notes"}
            </Button>
          </form>
        </Paper>

        {/* Show spinner only when loading but not streaming */}
        {loading && !streaming ? <LoadingSpinner /> : null}

        {/* Show notes either when streaming or when finished with notes */}
        {(streaming || (!loading && notes)) && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {streaming ? "Generating Notes..." : "Generated Notes:"}
            </Typography>
            <div className="markdown-content">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
