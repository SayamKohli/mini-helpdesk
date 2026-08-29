import {
  Box,
  Toolbar,
} from "@mui/material";

import type { ReactNode } from "react";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({
  children,
}: AppLayoutProps) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "#f5f6f8",
        }}
      >
        <Toolbar />

        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};