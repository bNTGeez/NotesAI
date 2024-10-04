"use client";
import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const handleHome = () => {
    router.push("/");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#000" }}>
      <Toolbar>
        <Button sx={{ color: "#fff" }} onClick={handleHome}>
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
