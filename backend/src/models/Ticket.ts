import { Schema, model, type InferSchemaType, Types } from "mongoose";

export const TICKET_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "RESOLVED",
  "CLOSED",
] as const;

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
  },
  {
    _id: false,
  },
);

const ticketSchema = new Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },

    customer: {
      type: customerSchema,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10000,
    },

    priority: {
      type: String,
      required: true,
      enum: TICKET_PRIORITIES,
      default: "MEDIUM",
      index: true,
    },

    status: {
      type: String,
      required: true,
      enum: TICKET_STATUSES,
      default: "OPEN",
      index: true,
    },

    assignee: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
      index: true,
    },

    latestAgentReply: {
      type: String,
      default: null,
      trim: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  },
);

ticketSchema.index({
  assignee: 1,
  status: 1,
  priority: 1,
  createdAt: -1,
});

ticketSchema.index({
  subject: "text",
  body: "text",
});

export type Customer = InferSchemaType<typeof customerSchema>;
export type Ticket = InferSchemaType<typeof ticketSchema>;

export const TicketModel = model<Ticket>("Ticket", ticketSchema);