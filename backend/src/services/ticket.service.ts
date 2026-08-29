import { Types } from "mongoose";

import {
  TicketModel,
} from "../models/Ticket";

import { TicketEventModel } from "../models/TicketEvent";

import type {
  CreateTicketInput,
  TicketListQuery,
  ReplyTicketInput,
  UpdateTicketStatusInput,
  ReassignTicketInput,
} from "../validators/ticket.validator";

import type {
  AuthenticatedUser,
} from "../middleware/auth.middleware";

import { AgentModel } from "../models/Agent";

const generateTicketId = async (): Promise<string> => {
  const latestTicket = await TicketModel.findOne()
    .sort({ ticketId: -1 })
    .select("ticketId");

  if (!latestTicket) {
    return "HD-10001";
  }

  const latestNumber = Number(
    latestTicket.ticketId.replace("HD-", ""),
  );

  if (!Number.isInteger(latestNumber)) {
    throw new Error("Unable to generate ticket ID");
  }

  return `HD-${latestNumber + 1}`;
};

export const createTicket = async (
  input: CreateTicketInput,
): Promise<{ ticketId: string }> => {
  const ticketId = await generateTicketId();

  const ticket = await TicketModel.create({
    ticketId,
    customer: {
      name: input.name,
      email: input.email.toLowerCase(),
    },
    subject: input.subject,
    body: input.body,
    priority: input.priority,
    status: "OPEN",
    assignee: null,
    latestAgentReply: null,
  });

  await TicketEventModel.create({
    ticketId: ticket._id,
    type: "CREATED",
    actor: null,
    metadata: {},
  });

  return {
    ticketId: ticket.ticketId,
  };
};

export type TicketListResult = {
  tickets: Array<{
    id: string;
    ticketId: string;
    customer: {
      name: string;
      email: string;
    };
    subject: string;
    priority: string;
    status: string;
    assignee: {
      id: string;
      name: string;
      email: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  }>;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PopulatedAssignee = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

type TicketDatabaseFilter = {
  assignee?: Types.ObjectId | string;

  status?: TicketListQuery["status"];

  priority?: TicketListQuery["priority"];

  $or?: Array<{
    subject?: {
      $regex: string;
      $options: string;
    };

    body?: {
      $regex: string;
      $options: string;
    };
  }>;
};

export const listTickets = async (
  query: TicketListQuery,
  user: AuthenticatedUser,
): Promise<TicketListResult> => {
  const filter: TicketDatabaseFilter = {};

  /*
   * Authorization is enforced directly in the database query.
   *
   * Agents can only see tickets assigned to themselves.
   * Admins can see all tickets and optionally filter by assignee.
   */
  if (user.role === "agent") {
    filter.assignee = user.id;
  } else if (query.assignee) {
    filter.assignee = query.assignee;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.search) {
    filter.$or = [
      {
        subject: {
          $regex: query.search,
          $options: "i",
        },
      },
      {
        body: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [tickets, total] = await Promise.all([
    TicketModel.find(filter)
      .populate<{ assignee: PopulatedAssignee | null }>(
        "assignee",
        "name email",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),

    TicketModel.countDocuments(filter),
  ]);

  return {
    tickets: tickets.map((ticket) => ({
      id: ticket._id.toString(),

      ticketId: ticket.ticketId,

      customer: ticket.customer,

      subject: ticket.subject,

      priority: ticket.priority,

      status: ticket.status,

      assignee: ticket.assignee
        ? {
            id: ticket.assignee._id.toString(),
            name: ticket.assignee.name,
            email: ticket.assignee.email,
          }
        : null,

      createdAt: ticket.createdAt,

      updatedAt: ticket.updatedAt,
    })),

    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export type TicketDetailResult = {
  ticket: {
    id: string;
    ticketId: string;

    customer: {
      name: string;
      email: string;
    };

    subject: string;

    body: string;

    priority: string;

    status: string;

    assignee: {
      id: string;
      name: string;
      email: string;
    } | null;

    latestAgentReply: string | null;

    createdAt: Date;

    updatedAt: Date;
  };

  timeline: Array<{
    id: string;

    type: string;

    actor: {
      id: string;
      name: string;
      email: string;
    } | null;

    metadata: unknown;

    createdAt: Date;
  }>;
};

type PopulatedActor = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

export const getTicketDetail = async (
  ticketId: string,
  user: AuthenticatedUser,
): Promise<TicketDetailResult> => {
  const ticket = await TicketModel.findOne({
    ticketId,
  })
    .populate<{ assignee: PopulatedAssignee | null }>(
      "assignee",
      "name email",
    )
    .lean();

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  /*
   * Admins can access every ticket.
   *
   * Agents can only access tickets assigned to themselves.
   *
   * We intentionally return "Ticket not found" for an unauthorized
   * agent so that ticket existence is not leaked.
   */
  if (
    user.role === "agent" &&
    (!ticket.assignee ||
      ticket.assignee._id.toString() !== user.id)
  ) {
    throw new Error("Ticket not found");
  }

  const events = await TicketEventModel.find({
    ticketId: ticket._id,
  })
    .populate<{ actor: PopulatedActor | null }>(
      "actor",
      "name email",
    )
    .sort({ createdAt: 1 })
    .lean();

  return {
    ticket: {
      id: ticket._id.toString(),

      ticketId: ticket.ticketId,

      customer: ticket.customer,

      subject: ticket.subject,

      body: ticket.body,

      priority: ticket.priority,

      status: ticket.status,

      assignee: ticket.assignee
        ? {
            id: ticket.assignee._id.toString(),
            name: ticket.assignee.name,
            email: ticket.assignee.email,
          }
        : null,

      latestAgentReply: ticket.latestAgentReply ?? null,

      createdAt: ticket.createdAt,

      updatedAt: ticket.updatedAt,
    },

    timeline: events.map((event) => ({
      id: event._id.toString(),

      type: event.type,

      actor: event.actor
        ? {
            id: event.actor._id.toString(),
            name: event.actor.name,
            email: event.actor.email,
          }
        : null,

      metadata: event.metadata,

      createdAt: event.createdAt,
    })),
  };
};

export type ReplyTicketResult = {
  ticketId: string;
  latestAgentReply: string;
};

export const replyToTicket = async (
  ticketId: string,
  input: ReplyTicketInput,
  user: AuthenticatedUser,
): Promise<ReplyTicketResult> => {
  const ticket = await TicketModel.findOne({ ticketId });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  /*
   * Authorization belongs here as well as in the route.
   *
   * Admins can reply to any ticket.
   * Agents can reply only to tickets assigned to themselves.
   */
  if (
    user.role === "agent" &&
    (!ticket.assignee ||
      ticket.assignee.toString() !== user.id)
  ) {
    throw new Error("Ticket not found");
  }

  const message = input.message.trim();

  ticket.latestAgentReply = message;

  await ticket.save();

  await TicketEventModel.create({
    ticketId: ticket._id,
    type: "REPLIED",
    actor: user.id,
    metadata: {
        message,
        },
  });

  return {
    ticketId: ticket.ticketId,
    latestAgentReply: ticket.latestAgentReply,
  };
};

export type UpdateTicketStatusResult = {
  ticketId: string;
  previousStatus: string;
  status: string;
};

export const updateTicketStatus = async (
  ticketId: string,
  input: UpdateTicketStatusInput,
  user: AuthenticatedUser,
): Promise<UpdateTicketStatusResult> => {
  const ticket = await TicketModel.findOne({ ticketId });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  /*
   * Admins can update any ticket.
   * Agents can only update tickets assigned to themselves.
   */
  if (
    user.role === "agent" &&
    (!ticket.assignee ||
      ticket.assignee.toString() !== user.id)
  ) {
    throw new Error("Ticket not found");
  }

  const previousStatus = ticket.status;

  /*
   * There is no meaningful timeline event if the
   * status hasn't actually changed.
   */
  if (previousStatus === input.status) {
    throw new Error("Ticket already has this status");
  }

  ticket.status = input.status;

  await ticket.save();

  await TicketEventModel.create({
    ticketId: ticket._id,
    type: "STATUS_CHANGED",
    actor: user.id,
    metadata: {
      from: previousStatus,
      to: input.status,
    },
  });

  return {
    ticketId: ticket.ticketId,
    previousStatus,
    status: ticket.status,
  };
};

export type ReassignTicketResult = {
  ticketId: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export const reassignTicket = async (
  ticketId: string,
  input: ReassignTicketInput,
  user: AuthenticatedUser,
): Promise<ReassignTicketResult> => {
  // Only admins can assign or unassign tickets.
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const ticket = await TicketModel.findOne({
    ticketId,
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const previousAssignee = ticket.assignee
    ? ticket.assignee.toString()
    : null;

  let newAssignee: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  } | null = null;

  /*
   * assigneeId === null means explicitly unassign
   * the ticket.
   */
  if (input.assigneeId) {
    const agent = await AgentModel.findOne({
      _id: input.assigneeId,
      role: "agent",
    }).select("_id name email");

    if (!agent) {
      throw new Error("Assignee not found");
    }

    newAssignee = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
    };

    ticket.assignee = agent._id;
  } else {
    ticket.assignee = null;
  }

  await ticket.save();

  await TicketEventModel.create({
    ticketId: ticket._id,
    type: "REASSIGNED",
    actor: user.id,
    metadata: {
      from: previousAssignee,
      to: newAssignee
        ? newAssignee._id.toString()
        : null,
    },
  });

  return {
    ticketId: ticket.ticketId,
    assignee: newAssignee
      ? {
          id: newAssignee._id.toString(),
          name: newAssignee.name,
          email: newAssignee.email,
        }
      : null,
  };
};

export type PublicTicketStatusResult = {
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  latestAgentReply: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getPublicTicketStatus = async (
  ticketId: string,
  email: string,
): Promise<PublicTicketStatusResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const ticket = await TicketModel.findOne({
    ticketId,
    "customer.email": normalizedEmail,
  }).lean();

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return {
    ticketId: ticket.ticketId,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    latestAgentReply: ticket.latestAgentReply ?? null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};