import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";

import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const drawerWidth = 220;

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <List>
          <ListItemButton
            component={Link}
            to="/tickets"
            selected={
              location.pathname === "/tickets"
            }
          >
            <ListItemText primary="Tickets" />
          </ListItemButton>
        </List>

        <Box sx={{ mt: "auto" }}>
          <Divider />

          {user && (
            <Box sx={{ p: 2 }}>
              <ListItemButton
                onClick={handleLogout}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};