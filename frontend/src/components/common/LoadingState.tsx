import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

type LoadingStateProps = {
  message?: string;
};

export const LoadingState = ({
  message = "Loading...",
}: LoadingStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        gap: 2,
      }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress />

      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
