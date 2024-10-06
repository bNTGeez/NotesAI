"use client";
import { TextField, Typography, Button, Stack, Box } from "@mui/material";
import Navbar from "../components/Navbar";
import React, { useState, ChangeEvent, FormEvent } from "react";
import ReactMarkdown from "react-markdown";

const CreateNotes = () => {
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "primary.main",
        }}
      >
        <Typography variant="h3" sx={{ mt: 10 }}>
          Generate Notes
        </Typography>
        <Typography sx={{ fontSize: 10 }}>
          Youtube links are currently not supported, please use the VideoID
        </Typography>
        <Typography sx={{ fontSize: 10 }}>
          Ex: https://www.youtube.com/watch?v=KsXp22QLMv0&ab_channel=BrianCache
        </Typography>
        <Typography sx={{ fontSize: 10 }}>VideoID: KsXp22QLMv0</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Insert Youtube VideoID"
              id="outlined-size-normal"
              onChange={handleInputChange}
              sx={{
                mt: 10,
                width: "400px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "15px", 
                  "& fieldset": {
                    borderColor: "black", 
                  },
                },
                "& .MuiOutlinedInput-input": {
                  backgroundColor: "white", 
                  borderRadius: "inherit", 
                  padding: "12px", 
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{ mx: 2, mt: 11, backgroundColor: "secondary.main" }}
            >
              Create
            </Button>
          </form>
        </Box>
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
            sx={{ mt: 10, overflowY: "auto", backgroundColor: 'white'}}
          >
            <Typography>
              <ReactMarkdown>{notes}</ReactMarkdown>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default CreateNotes;
