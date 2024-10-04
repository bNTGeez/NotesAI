"use client";
import { TextField, Typography, Button } from "@mui/material";
import Navbar from "../components/Navbar";
import React, { useState, ChangeEvent, FormEvent } from "react";

const createNotes = () => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submit Value", inputValue);
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
      </div>
    </>
  );
};

export default createNotes;
