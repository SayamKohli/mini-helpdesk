import {
  AppBar,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";

import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          Mini Helpdesk
        </Typography>

        {user && (
          <Box>
            <Typography
              variant="body2"
              component="span"
            >
              {user.name} ({user.role})
            </Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};