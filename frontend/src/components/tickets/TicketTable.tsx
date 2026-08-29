import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type {
  TicketListItem,
} from "../../types/ticket";

type TicketTableProps = {
  tickets: TicketListItem[];
  onSelect: (ticketId: string) => void;
};

const priorityColor = (
  priority: TicketListItem["priority"],
) => {
  switch (priority) {
    case "URGENT":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    default:
      return "default";
  }
};

const statusColor = (
  status: TicketListItem["status"],
) => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "WAITING_ON_CUSTOMER":
      return "secondary";
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
};

export const TicketTable = ({
  tickets,
  onSelect,
}: TicketTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ticket</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assignee</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                sx={{ py: 6 }}
              >
                <Typography color="text.secondary">
                  No tickets found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                hover
                onClick={() =>
                  onSelect(ticket.ticketId)
                }
                sx={{
                  cursor: "pointer",
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>
                    {ticket.ticketId}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography>
                    {ticket.customer.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {ticket.customer.email}
                  </Typography>
                </TableCell>

                <TableCell>
                  {ticket.subject}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={ticket.priority}
                    color={priorityColor(
                      ticket.priority,
                    )}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={ticket.status.replaceAll(
                      "_",
                      " ",
                    )}
                    color={statusColor(
                      ticket.status,
                    )}
                  />
                </TableCell>

                <TableCell>
                  {ticket.assignee?.name ??
                    "Unassigned"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};