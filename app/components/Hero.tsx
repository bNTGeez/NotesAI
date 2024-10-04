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
        variant='h2'
      >
        Welcome to Notes Taker!
      </Typography>
      <Button
        sx={{
          mt: 5, 
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
