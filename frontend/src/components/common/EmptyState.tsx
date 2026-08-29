import {
  Box,
  Typography,
} from "@mui/material";

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export const EmptyState = ({
  title = "Nothing here yet",
  message = "There is no data to display.",
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 8,
        px: 2,
      }}
      role="status"
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {message}
      </Typography>
    </Box>
  );
};
