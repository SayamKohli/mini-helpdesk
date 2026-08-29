import {
  Alert,
  Box,
  Button,
} from "@mui/material";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <Box sx={{ py: 4 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
};

