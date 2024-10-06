"use client";
import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useRouter } from "next/navigation"; // Corrected import for useRouter

const Navbar = () => {
  const router = useRouter();

  const handleHome = () => {
    router.push("/");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#fff" }}>
      <Toolbar>
        <Button sx={{ color: "#000" }} onClick={handleHome}>
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
