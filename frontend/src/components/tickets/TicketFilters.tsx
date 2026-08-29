import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import type {
  TicketListQuery,
  TicketPriority,
  TicketStatus,
} from "../../types/ticket";

type TicketFiltersProps = {
  filters: TicketListQuery;
  onChange: (filters: TicketListQuery) => void;
};

const statuses: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];

const priorities: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const TicketFilters = ({
  filters,
  onChange,
}: TicketFiltersProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        mb: 3,
      }}
    >
      <TextField
        label="Search"
        value={filters.search ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value || undefined,
          })
        }
        size="small"
      />

      <FormControl
        size="small"
        sx={{ minWidth: 180 }}
      >
        <InputLabel>Status</InputLabel>

        <Select
          label="Status"
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              status:
                (event.target.value as TicketStatus) ||
                undefined,
            })
          }
        >
          <MenuItem value="">
            All Statuses
          </MenuItem>

          {statuses.map((status) => (
            <MenuItem
              key={status}
              value={status}
            >
              {status.replaceAll("_", " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{ minWidth: 180 }}
      >
        <InputLabel>Priority</InputLabel>

        <Select
          label="Priority"
          value={filters.priority ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              priority:
                (event.target.value as TicketPriority) ||
                undefined,
            })
          }
        >
          <MenuItem value="">
            All Priorities
          </MenuItem>

          {priorities.map((priority) => (
            <MenuItem
              key={priority}
              value={priority}
            >
              {priority}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};