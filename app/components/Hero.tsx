'use client'
import React from "react";
import { Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const handleStart = () => {
    router.push('/createNotes')
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Typography
        sx={{
          fontSize: 50,
        }}
      >
        Welcome to Notes Taker!
      </Typography>
      <Button
        sx={{
          backgroundColor: "black",
          color: "white",
        }}
        onClick={handleStart}
      >
        Get Started
      </Button>
    </div>
  );
};

export default Hero;
