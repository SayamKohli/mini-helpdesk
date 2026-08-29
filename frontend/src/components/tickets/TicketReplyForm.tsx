import {
  useState,
  type FormEvent,
} from "react";

import {
  Alert,
  Button,
  Stack,
  TextField,
} from "@mui/material";

import { replyToTicket } from "../../services/ticket.service";

type TicketReplyFormProps = {
  ticketId: string;
  onSuccess: () => void;
};

export const TicketReplyForm = ({
  ticketId,
  onSuccess,
}: TicketReplyFormProps) => {
  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await replyToTicket(
        ticketId,
        {
          message: message.trim(),
        },
      );

      setMessage("");
      onSuccess();
    } catch {
      setError(
        "Failed to send reply.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <TextField
          multiline
          minRows={4}
          fullWidth
          label="Reply"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          disabled={submitting}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={
            submitting ||
            !message.trim()
          }
          sx={{ alignSelf: "flex-start" }}
        >
          {submitting
            ? "Sending..."
            : "Send Reply"}
        </Button>
      </Stack>
    </form>
  );
};