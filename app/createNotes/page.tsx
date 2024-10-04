"use client";
import { TextField, Typography, Button, Stack, Box } from "@mui/material";
import Navbar from "../components/Navbar";
import React, { useState, ChangeEvent, FormEvent } from "react";
import ReactMarkdown from "react-markdown";

const createNotes = () => {
  const [inputValue, setInputValue] = useState("");
  const [notes, setNotes] = useState("");

  const getTranscript = async () => {
    console.log("Input Value", inputValue);
    try {
      const response = await fetch("api/createNotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: inputValue }),
      });

      console.log("HTTP Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to get transcript", error);
      setNotes("Failed to get Notes" + error);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log("Updated Value", event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    getTranscript();
    setInputValue("");
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center">
        <Typography variant="h3" sx={{ mt: 10 }}>
          Generate Notes
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Insert Youtube Link"
            id="outlined-size-normal"
            onChange={handleInputChange}
            sx={{
              mt: 10,
              width: "700px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
              },
            }}
          ></TextField>
          <Button type="submit" sx={{ mb: 2 }}>
            Create
          </Button>
        </form>
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack
            direction={"column"}
            width="600px"
            height="800px"
            border="2px solid grey"
            borderRadius="16px"
            p={2}
            spacing={3}
          >
            <Typography>
              <ReactMarkdown>{notes}</ReactMarkdown>
            </Typography>
          </Stack>
        </Box>
      </div>
    </>
  );
};

export default createNotes;
