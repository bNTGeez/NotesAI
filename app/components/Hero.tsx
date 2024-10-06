"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const handleStart = () => {
    router.push("/createNotes");
  };
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h2">Welcome to Notes Taker!</Typography>
      <Button
        sx={{
          mb: 25,
          mt: 5,
          backgroundColor: "secondary.main",
          color: "black",
        }}
        onClick={handleStart}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default Hero;
