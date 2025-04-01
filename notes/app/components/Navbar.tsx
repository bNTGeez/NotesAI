"use client";
import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from "@mui/material";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Create Notes", path: "/createNotes" },
  ];

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "background.paper" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              color: "text.primary",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
            onClick={() => router.push("/")}
          >
            NotesAI
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => router.push(item.path)}
                sx={{
                  color: "text.primary",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "primary.main",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
