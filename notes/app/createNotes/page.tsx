"use client";
import {
  TextField,
  Typography,
  Button,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import Navbar from "../components/Navbar";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const CreateNotes = () => {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/createNotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get notes");
      setNotes("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", pt: 8, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ mb: 2, fontWeight: 600 }}>
            Generate Notes
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 6 }}>
            <TextField
              fullWidth
              label="YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              error={!!error}
              helperText={error}
              placeholder="https://www.youtube.com/watch?v=..."
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={loading || !url}
              sx={{
                minWidth: "140px",
                position: "relative",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ position: "absolute" }} />
              ) : (
                "Generate Notes"
              )}
            </Button>
          </Box>

          {notes && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 3,
                bgcolor: "background.paper",
                minHeight: "400px",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              <ReactMarkdown>{notes}</ReactMarkdown>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CreateNotes;
