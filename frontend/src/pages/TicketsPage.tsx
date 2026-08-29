import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  // Button,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { getTickets } from "../services/ticket.service";

import type {
  TicketListItem,
  TicketListQuery,
  TicketListResponse,
} from "../types/ticket";

import { TicketFilters } from "../components/tickets/TicketFilters";
import { TicketTable } from "../components/tickets/TicketTable";

export const TicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<TicketListItem[]>([]);

  const [pagination, setPagination] =
    useState<TicketListResponse["data"]["pagination"] | null>(null);

  const [filters, setFilters] = useState<TicketListQuery>({
    page: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async (
    query: TicketListQuery,
  ): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const response = await getTickets(query);

      setTickets(response.data.tickets);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("GET TICKETS FAILED:", error);
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets(filters);
  }, [filters]);

  const handleFilterChange = (
    nextFilters: TicketListQuery,
  ): void => {
    setFilters({
      ...nextFilters,
      page: 1,
    });
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ): void => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Tickets
          </Typography>

          <Typography color="text.secondary">
            Manage and track support tickets.
          </Typography>
        </Box>

{/* Currently only user level ticket creation but can extent
         <Button
          variant="contained"
          onClick={() => navigate("/tickets/new")}
        >
          New Ticket
        </Button> */}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <TicketFilters
          filters={filters}
          onChange={handleFilterChange}
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TicketTable
            tickets={tickets}
            onSelect={(ticketId) =>
              navigate(`/tickets/${ticketId}`)
            }
          />

          {pagination &&
            pagination.totalPages > 1 && (
              <Stack
                sx={{
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <Pagination
                  page={pagination.page}
                  count={pagination.totalPages}
                  onChange={handlePageChange}
                />
              </Stack>
            )}
        </>
      )}
    </Box>
  );
};