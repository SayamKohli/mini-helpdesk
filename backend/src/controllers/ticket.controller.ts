import type { Request, Response } from "express";

import {
  createTicket,
  getTicketDetail,
  listTickets,
  replyToTicket,
  updateTicketStatus,
  reassignTicket,
  getPublicTicketStatus,
} from "../services/ticket.service";

import {
  createTicketSchema,
  replyTicketSchema,
  ticketListQuerySchema,
  updateTicketStatusSchema,
  reassignTicketSchema,
} from "../validators/ticket.validator";


export const createTicketController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createTicketSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: result.error.flatten().fieldErrors,
    });

    return;
  }

  const ticket = await createTicket(result.data);

  res.status(201).json({
    status: "success",
    data: ticket,
  });
};

export const listTicketsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const result = ticketListQuerySchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      details: result.error.flatten().fieldErrors,
    });

    return;
  }

  const tickets = await listTickets(
    result.data,
    req.user,
  );

  res.status(200).json({
    status: "success",
    data: tickets,
  });
};

export const getTicketDetailController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const { ticketId } = req.params;

  if (typeof ticketId !== "string" || ticketId.length === 0) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Ticket ID is required",
    });

    return;
  }

  try {
    const ticket = await getTicketDetail(
      ticketId,
      req.user,
    );

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Ticket not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });

      return;
    }

    throw error;
  }
};

export const replyToTicketController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const result = replyTicketSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: result.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const { ticketId } = req.params;

if (typeof ticketId !== "string" || ticketId.length === 0) {
  res.status(400).json({
    status: "error",
    code: "VALIDATION_ERROR",
    message: "Ticket ID is required",
  });

  return;
}

const ticket = await replyToTicket(
  ticketId,
  result.data,
  req.user,
);
    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Ticket not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });

      return;
    }

    throw error;
  }
};

export const updateTicketStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const { ticketId } = req.params;

  if (typeof ticketId !== "string" || ticketId.length === 0) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Ticket ID is required",
    });

    return;
  }

  const result = updateTicketStatusSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: result.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const ticket = await updateTicketStatus(
      ticketId,
      result.data,
      req.user,
    );

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Ticket not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "Ticket already has this status"
    ) {
      res.status(409).json({
        status: "error",
        code: "TICKET_STATUS_UNCHANGED",
        message: "Ticket already has this status",
      });

      return;
    }

    throw error;
  }
};

export const reassignTicketController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const result = reassignTicketSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: result.error.flatten().fieldErrors,
    });

    return;
  }

  try {

    const { ticketId } = req.params;

if (typeof ticketId !== "string" || ticketId.length === 0) {
  res.status(400).json({
    status: "error",
    code: "VALIDATION_ERROR",
    message: "Ticket ID is required",
  });

  return;
}
    const ticket = await reassignTicket(
    ticketId,
    result.data,
    req.user,
    );

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Ticket not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "Assignee not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "ASSIGNEE_NOT_FOUND",
        message: "Assignee not found",
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      res.status(403).json({
        status: "error",
        code: "FORBIDDEN",
        message: "You do not have permission to reassign tickets",
      });

      return;
    }

    throw error;
  }
};

export const getPublicTicketStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ticketId } = req.params;

  const email =
    typeof req.query.email === "string"
      ? req.query.email
      : "";

  if (
    typeof ticketId !== "string" ||
    ticketId.length === 0 ||
    !email
  ) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Ticket ID and email are required",
    });

    return;
  }

  try {
    const ticket =
      await getPublicTicketStatus(
        ticketId,
        email,
      );

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Ticket not found"
    ) {
      res.status(404).json({
        status: "error",
        code: "TICKET_NOT_FOUND",
        message:
          "Ticket not found or email does not match",
      });

      return;
    }

    throw error;
  }
};