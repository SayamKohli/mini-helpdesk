import {
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type {
  TicketTimelineEvent,
} from "../../types/ticket";

type TicketTimelineProps = {
  events: TicketTimelineEvent[];
};

const getEventLabel = (
  event: TicketTimelineEvent,
): string => {
  switch (event.type) {
    case "CREATED":
      return "Ticket created";

    case "REASSIGNED":
      return "Ticket reassigned";

    case "REPLIED":
      return "Agent replied";

    case "STATUS_CHANGED":
      return "Status changed";
  }
};

export const TicketTimeline = ({
  events,
}: TicketTimelineProps) => {
  if (events.length === 0) {
    return (
      <Typography color="text.secondary">
        No timeline events.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {events.map((event, index) => (
        <Box key={event.id}>
          <Typography sx={{ fontWeight: 600 }}>
            {getEventLabel(event)}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {event.actor?.name ?? "System"}
          </Typography>

          {event.type === "REASSIGNED" &&
            event.metadata && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {event.metadata.from
                  ? "Assignment changed."
                  : "Ticket unassigned."}
              </Typography>
            )}

          {event.type === "STATUS_CHANGED" &&
            event.metadata?.to && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {event.metadata.from
                  ? `Status changed from ${event.metadata.from.replaceAll(
                      "_",
                      " ",
                    )} to ${event.metadata.to.replaceAll(
                      "_",
                      " ",
                    )}.`
                  : `New status: ${event.metadata.to.replaceAll(
                      "_",
                      " ",
                    )}`}
              </Typography>
            )}

          {event.type === "REPLIED" &&
            event.metadata?.reply && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {event.metadata.reply}
              </Typography>
            )}

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {new Date(
              event.createdAt,
            ).toLocaleString()}
          </Typography>

          {index < events.length - 1 && (
            <Divider sx={{ mt: 2 }} />
          )}
        </Box>
      ))}
    </Stack>
  );
};