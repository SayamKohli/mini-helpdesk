import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  assignTicket,
  getTicketDetail,
  updateTicketStatus,
} from "../services/ticket.service";

import { getAgents } from "../services/agent.service";

import type {
  TicketDetailResponse,
  TicketStatus,
} from "../types/ticket";

import { TicketTimeline } from "../components/tickets/TicketTimeline";
import { TicketReplyForm } from "../components/tickets/TicketReplyForm";

import type { Agent } from "../services/agent.service";

import { useAuth } from "../hooks/useAuth";

export const TicketDetailPage = () => {
  const { ticketId } = useParams<{
    ticketId: string;
  }>();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [data, setData] =
    useState<TicketDetailResponse["data"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<TicketStatus | "">("");

  const [statusLoading, setStatusLoading] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAssignee, setSelectedAssignee] =
    useState<string>("");
  const [assigneeLoading, setAssigneeLoading] =
    useState(false);
  const [assigneeError, setAssigneeError] =
    useState("");

  const isAdmin = user?.role === "admin";

  const loadTicket = async (): Promise<void> => {
    if (!ticketId) {
      setError("Ticket ID is required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getTicketDetail(ticketId);

      setData(response.data);
      setStatus(response.data.ticket.status);

      setSelectedAssignee(
        response.data.ticket.assignee?.id ?? "",
      );
    } catch (error) {
      console.error("GET TICKET FAILED:", error);
      setError("Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async (): Promise<void> => {
    if (!isAdmin) {
      return;
    }

    try {
      setAssigneeError("");

      const response = await getAgents();

      setAgents(response.data.agents);
    } catch (error) {
      console.error("GET AGENTS FAILED:", error);

      setAssigneeError(
        "Failed to load available agents.",
      );
    }
  };

  useEffect(() => {
    void loadTicket();
  }, [ticketId]);

  useEffect(() => {
    if (isAdmin) {
      void loadAgents();
    }
  }, [isAdmin]);

  const handleStatusChange = async (
    nextStatus: TicketStatus,
  ): Promise<void> => {
    if (!ticketId || !data) {
      return;
    }

    if (nextStatus === data.ticket.status) {
      return;
    }

    try {
      setStatusLoading(true);
      setStatusError("");

      await updateTicketStatus(
        ticketId,
        {
          status: nextStatus,
        },
      );

      setStatus(nextStatus);

      await loadTicket();
    } catch (error) {
      console.error(
        "UPDATE TICKET STATUS FAILED:",
        error,
      );

      setStatusError(
        "Failed to update ticket status.",
      );

      setStatus(data.ticket.status);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssigneeChange = async (
    nextAssigneeId: string,
  ): Promise<void> => {
    if (!ticketId || !data) {
      return;
    }

    const previousAssignee =
      data.ticket.assignee?.id ?? "";

    if (nextAssigneeId === previousAssignee) {
      return;
    }

    try {
      setAssigneeLoading(true);
      setAssigneeError("");

      await assignTicket(ticketId, {
        assigneeId:
          nextAssigneeId === ""
            ? null
            : nextAssigneeId,
      });

      setSelectedAssignee(nextAssigneeId);

      await loadTicket();
    } catch (error) {
      console.error(
        "ASSIGN TICKET FAILED:",
        error,
      );

      setAssigneeError(
        "Failed to assign ticket.",
      );

      setSelectedAssignee(previousAssignee);
    } finally {
      setAssigneeLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {error || "Ticket not found."}
        </Alert>

        <Button
          variant="outlined"
          onClick={() => navigate("/tickets")}
        >
          Back to Tickets
        </Button>
      </Stack>
    );
  }

  const { ticket, timeline } = data;

  return (
    <Box>
      <Button
        onClick={() => navigate("/tickets")}
        sx={{ mb: 2 }}
      >
        ← Back to Tickets
      </Button>

      <Stack spacing={3}>
        {/* Ticket information */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                sx={{
                  justifyContent: "space-between",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                  >
                    {ticket.ticketId}
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {ticket.subject}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={ticket.priority}
                    color="warning"
                    variant="outlined"
                  />

                  <Chip
                    label={status.replaceAll(
                      "_",
                      " ",
                    )}
                  />
                </Stack>
              </Stack>

              <Divider />

              {/* Customer */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5 }}
                >
                  Customer
                </Typography>

                <Typography>
                  {ticket.customer.name}
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  {ticket.customer.email}
                </Typography>
              </Box>

              {/* Assignee display */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5 }}
                >
                  Assignee
                </Typography>

                <Typography>
                  {ticket.assignee?.name ??
                    "Unassigned"}
                </Typography>

                {ticket.assignee?.email && (
                  <Typography
                    color="text.secondary"
                  >
                    {ticket.assignee.email}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1 }}
                >
                  Description
                </Typography>

                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {ticket.body}
                </Typography>
              </Box>

              {/* Latest reply */}
              {ticket.latestAgentReply && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                  >
                    Latest Agent Reply
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        "background.default",
                    }}
                  >
                    <CardContent>
                      <Typography
                        sx={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {ticket.latestAgentReply}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Admin management */}
        {isAdmin && (
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Ticket Management
                </Typography>

                {/* Status */}
                <Box>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={status}
                    disabled={statusLoading}
                    onChange={(event) => {
                      void handleStatusChange(
                        event.target
                          .value as TicketStatus,
                      );
                    }}
                  >
                    <MenuItem value="OPEN">
                      OPEN
                    </MenuItem>

                    <MenuItem value="IN_PROGRESS">
                      IN PROGRESS
                    </MenuItem>

                    <MenuItem value="WAITING_ON_CUSTOMER">
                      WAITING ON CUSTOMER
                    </MenuItem>

                    <MenuItem value="RESOLVED">
                      RESOLVED
                    </MenuItem>

                    <MenuItem value="CLOSED">
                      CLOSED
                    </MenuItem>
                  </TextField>

                  {statusLoading && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Updating status...
                    </Typography>
                  )}

                  {statusError && (
                    <Alert
                      severity="error"
                      sx={{ mt: 1 }}
                    >
                      {statusError}
                    </Alert>
                  )}
                </Box>

                {/* Assignee */}
                <Box>
                  <TextField
                    select
                    fullWidth
                    label="Assign Ticket"
                    value={selectedAssignee}
                    disabled={
                      assigneeLoading
                    }
                    onChange={(event) => {
                      void handleAssigneeChange(
                        event.target.value,
                      );
                    }}
                  >
                    <MenuItem value="">
                      Unassigned
                    </MenuItem>

                    {agents.map((agent) => (
                      <MenuItem
                        key={agent.id}
                        value={agent.id}
                      >
                        {agent.name} —{" "}
                        {agent.email}
                      </MenuItem>
                    ))}
                  </TextField>

                  {assigneeLoading && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Updating assignee...
                    </Typography>
                  )}

                  {assigneeError && (
                    <Alert
                      severity="error"
                      sx={{ mt: 1 }}
                    >
                      {assigneeError}
                    </Alert>
                  )}

                  {!assigneeLoading &&
                    !assigneeError &&
                    agents.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        No agents available for
                        assignment.
                      </Typography>
                    )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Timeline
            </Typography>

            <TicketTimeline
              events={timeline}
            />
          </CardContent>
        </Card>

        {/* Reply */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Reply
            </Typography>

            <TicketReplyForm
              ticketId={ticket.ticketId}
              onSuccess={loadTicket}
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
