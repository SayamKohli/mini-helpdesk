import { Schema, model, type InferSchemaType, Types } from "mongoose";

export const TICKET_EVENT_TYPES = [
  "CREATED",
  "REASSIGNED",
  "REPLIED",
  "STATUS_CHANGED",
] as const;

const ticketEventSchema = new Schema(
  {
    ticketId: {
      type: Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: TICKET_EVENT_TYPES,
    },

    actor: {
      type: Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

ticketEventSchema.index({
  ticketId: 1,
  createdAt: 1,
});

export type TicketEvent = InferSchemaType<typeof ticketEventSchema>;

export const TicketEventModel = model<TicketEvent>(
  "TicketEvent",
  ticketEventSchema,
);