import { useState, type FormEvent } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { createTicket } from "../services/ticket.service";

import type {
  CreateTicketInput,
  TicketPriority,
} from "../types/ticket";

export const NewTicketPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateTicketInput>({
    name: "",
    email: "",
    subject: "",
    body: "",
    priority: "MEDIUM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  const handleChange = (
    field: keyof CreateTicketInput,
    value: string,
  ): void => {
    setForm((current) => ({
      ...current,
      [field]:
        field === "priority"
          ? (value as TicketPriority)
          : value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await createTicket({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        body: form.body.trim(),
      });

      setTicketId(response.data.ticketId);
    } catch (error: unknown) {
      console.error("CREATE TICKET FAILED:", error);

      setError(
        "Failed to create ticket. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (ticketId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 520 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
                >
                  Ticket Submitted
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Your support ticket has been created
                  successfully.
                </Typography>
              </Box>

              <Alert severity="success">
                Your ticket ID is:
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    fontWeight: 700,
                  }}
                >
                  {ticketId}
                </Typography>
              </Alert>

              <Typography>
                Save this ticket ID. You will need it
                together with your email address to
                check your ticket status.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/check-status")
                  }
                >
                  Check Ticket Status
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setTicketId("");
                    setForm({
                      name: "",
                      email: "",
                      subject: "",
                      body: "",
                      priority: "MEDIUM",
                    });
                  }}
                >
                  Submit Another Ticket
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          sm: 4,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 760,
          mx: "auto",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700 }}
            >
              Contact Support
            </Typography>

            <Typography color="text.secondary">
              Submit a support request and our team
              will get back to you.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <Stack
                spacing={3}
                component="form"
                onSubmit={handleSubmit}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    required
                    label="Name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value,
                      )
                    }
                  />

                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    value={form.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value,
                      )
                    }
                  />
                </Stack>

                <TextField
                  fullWidth
                  required
                  label="Subject"
                  value={form.subject}
                  onChange={(event) =>
                    handleChange(
                      "subject",
                      event.target.value,
                    )
                  }
                />

                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={7}
                  label="Message"
                  value={form.body}
                  onChange={(event) =>
                    handleChange(
                      "body",
                      event.target.value,
                    )
                  }
                />

                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={form.priority}
                  onChange={(event) =>
                    handleChange(
                      "priority",
                      event.target.value,
                    )
                  }
                >
                  <MenuItem value="LOW">
                    Low
                  </MenuItem>

                  <MenuItem value="MEDIUM">
                    Medium
                  </MenuItem>

                  <MenuItem value="HIGH">
                    High
                  </MenuItem>

                  <MenuItem value="URGENT">
                    Urgent
                  </MenuItem>
                </TextField>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() =>
                      navigate("/check-status")
                    }
                  >
                    Check Existing Ticket
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Ticket"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
};