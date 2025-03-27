"use client";
import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const handleStart = () => {
    router.push("/createNotes");
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
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 6,
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              Transform YouTube Videos into Notes
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: "text.secondary",
                fontWeight: 400,
              }}
            >
              Effortlessly convert your favorite YouTube content into organized,
              searchable notes. Save time and enhance your learning experience.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{
                py: 1.5,
                px: 3,
                fontSize: "1rem",
                borderRadius: 1,
                textTransform: "none",
                backgroundColor: "text.primary",
                "&:hover": {
                  backgroundColor: "text.primary",
                  opacity: 0.9,
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
