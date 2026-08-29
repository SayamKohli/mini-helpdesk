import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { getPublicTicketStatus } from "../services/ticket.service";

type PublicTicketStatus = {
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  latestAgentReply: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TicketsStatusPage = () => {
  const navigate = useNavigate();

  const [ticketId, setTicketId] = useState("");
  const [email, setEmail] = useState("");

  const [ticket, setTicket] =
    useState<PublicTicketStatus | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setTicket(null);

      const response =
        await getPublicTicketStatus(
          ticketId.trim(),
          email.trim(),
        );

      setTicket(response.data);
    } catch (error: any) {
      console.error(
        "GET PUBLIC TICKET STATUS FAILED:",
        error,
      );

      setError(
        error?.response?.data?.message ??
          "Ticket not found or email does not match.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
        py: 6,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Check Ticket Status
            </Typography>

            <Typography color="text.secondary">
              Enter your ticket ID and email address
              to check the latest status.
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Stack
                spacing={3}
                component="form"
                onSubmit={handleSubmit}
              >
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  required
                  label="Ticket ID"
                  value={ticketId}
                  onChange={(event) =>
                    setTicketId(event.target.value)
                  }
                />

                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Check Status"
                  )}
                </Button>

                <Button
                  variant="text"
                  onClick={() =>
                    navigate("/submit-ticket")
                  }
                  disabled={loading}
                >
                  Submit a New Ticket
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {ticket && (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {ticket.subject}
                  </Typography>

                  <Typography>
                    <strong>Ticket ID:</strong>{" "}
                    {ticket.ticketId}
                  </Typography>

                  <Typography>
                    <strong>Status:</strong>{" "}
                    {ticket.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </Typography>

                  <Typography>
                    <strong>Priority:</strong>{" "}
                    {ticket.priority}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Created:{" "}
                    {new Date(
                      ticket.createdAt,
                    ).toLocaleString()}
                  </Typography>

                  {ticket.latestAgentReply && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1 }}
                      >
                        Latest Agent Reply
                      </Typography>

                      <Typography
                        sx={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {ticket.latestAgentReply}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Box>
    </Box>
  );
};