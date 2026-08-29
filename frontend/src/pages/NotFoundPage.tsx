import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: "#f5f6f8",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 520,
          p: {
            xs: 3,
            sm: 5,
          },
          textAlign: "center",
        }}
      >
        <Stack
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: "4rem",
                sm: "6rem",
              },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
          >
            Page not found
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 400 }}
          >
            The page you are looking for does not
            exist or may have been moved.
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/")}
            >
              Go to Home
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
            >
              Agent Login
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
