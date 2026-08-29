import { z } from "zod";
import {TICKET_STATUSES} from "../models/Ticket";

export const createTicketSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email must not exceed 254 characters"),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must not exceed 200 characters"),

  body: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(10000, "Message must not exceed 10,000 characters"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const ticketListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum([
      "OPEN",
      "IN_PROGRESS",
      "WAITING_ON_CUSTOMER",
      "RESOLVED",
      "CLOSED",
    ])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  assignee: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid assignee ID")
    .optional(),

  search: z
    .string()
    .trim()
    .max(200)
    .optional(),
});

export type TicketListQuery = z.infer<
  typeof ticketListQuerySchema
>;

export const replyTicketSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(10000, "Reply is too long"),
});

export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});

export type UpdateTicketStatusInput = z.infer<
  typeof updateTicketStatusSchema
>;

export const reassignTicketSchema = z.object({
  assigneeId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid assignee ID")
    .nullable(),
});

export type ReassignTicketInput = z.infer<
  typeof reassignTicketSchema
>;