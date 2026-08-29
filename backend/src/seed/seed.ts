import mongoose from "mongoose";
import argon2 from "argon2";

import { env } from "../config/env";
import { AgentModel } from "../models/Agent";
import { TicketModel } from "../models/Ticket";
import { TicketEventModel } from "../models/TicketEvent";
import { logger } from "../utils/logger";

const DEMO_PASSWORD = "DemoPass123!";

const DEMO_AGENT_EMAILS = [
  "agent1@example.com",
  "agent2@example.com",
  "admin@example.com",
];

const DEMO_TICKET_IDS = [
  "HD-10001",
  "HD-10002",
  "HD-10003",
  "HD-10004",
  "HD-10005",
  "HD-10006",
  "HD-10007",
  "HD-10008",
  "HD-10009",
  "HD-10010",
];

const seed = async (): Promise<void> => {
  try {
    logger.info("Starting database seed");

    await mongoose.connect(env.MONGODB_URI);

    logger.info("Connected to MongoDB");

    /*
     * Clear only our demo dataset.
     *
     * Tickets are identified by their fixed demo ticket IDs.
     * Agents are identified by their example.com demo email addresses.
     */
    const existingDemoTickets = await TicketModel.find({
      ticketId: { $in: DEMO_TICKET_IDS },
    }).select("_id");

    const existingTicketIds = existingDemoTickets.map(
      (ticket) => ticket._id,
    );

    await TicketEventModel.deleteMany({
      ticketId: { $in: existingTicketIds },
    });

    await TicketModel.deleteMany({
      ticketId: { $in: DEMO_TICKET_IDS },
    });

    await AgentModel.deleteMany({
      email: {
        $in: DEMO_AGENT_EMAILS,
      },
    });

    /*
     * Create demo agents.
     *
     * All demo accounts use the same password so the accounts
     * are easy to test locally.
     */
    const passwordHash = await argon2.hash(DEMO_PASSWORD, {
      type: argon2.argon2id,
    });

    const agents = await AgentModel.create([
      {
        name: "Alex Morgan",
        email: "agent1@example.com",
        passwordHash,
        role: "agent",
      },
      {
        name: "Taylor Brooks",
        email: "agent2@example.com",
        passwordHash,
        role: "agent",
      },
      {
        name: "Jordan Lee",
        email: "admin@example.com",
        passwordHash,
        role: "admin",
      },
    ]);

    const agent1 = agents[0];
    const agent2 = agents[1];
    const admin = agents[2];

    if (!agent1 || !agent2 || !admin) {
      throw new Error("Failed to create demo agents");
    }

    logger.info(
      {
        agent1Id: agent1._id.toString(),
        agent2Id: agent2._id.toString(),
        adminId: admin._id.toString(),
      },
      "Demo agents created",
    );

    /*
     * Create demo tickets.
     *
     * Distribution:
     *
     * agent1:
     *   HD-10001
     *   HD-10002
     *   HD-10004
     *   HD-10007
     *   HD-10009
     *
     * agent2:
     *   HD-10003
     *   HD-10005
     *   HD-10008
     *
     * unassigned:
     *   HD-10006
     *   HD-10010
     */
    const tickets = await TicketModel.create([
      {
        ticketId: "HD-10001",
        customer: {
          name: "Sarah Miller",
          email: "sarah@example.com",
        },
        subject: "Unable to access account",
        body:
          "I am unable to log into my account even though my password is correct.",
        priority: "HIGH",
        status: "OPEN",
        assignee: agent1._id,
        latestAgentReply: null,
      },

      {
        ticketId: "HD-10002",
        customer: {
          name: "Daniel Carter",
          email: "daniel@example.com",
        },
        subject: "Payment was charged twice",
        body:
          "I noticed two charges for the same transaction on my account.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        assignee: agent1._id,
        latestAgentReply:
          "We are investigating the duplicate charge.",
      },

      {
        ticketId: "HD-10003",
        customer: {
          name: "Emily Wilson",
          email: "emily@example.com",
        },
        subject: "Password reset not working",
        body:
          "The password reset link I received is not allowing me to set a new password.",
        priority: "MEDIUM",
        status: "WAITING_ON_CUSTOMER",
        assignee: agent2._id,
        latestAgentReply:
          "Could you please confirm whether the latest reset link is still valid?",
      },

      {
        ticketId: "HD-10004",
        customer: {
          name: "Michael Brown",
          email: "michael@example.com",
        },
        subject: "Dashboard loading slowly",
        body:
          "The dashboard takes more than a minute to load after I sign in.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignee: agent1._id,
        latestAgentReply:
          "We are checking the performance issue on the dashboard.",
      },

      {
        ticketId: "HD-10005",
        customer: {
          name: "Olivia Davis",
          email: "olivia@example.com",
        },
        subject: "Incorrect invoice amount",
        body:
          "The amount shown on my latest invoice does not match my expected total.",
        priority: "MEDIUM",
        status: "OPEN",
        assignee: agent2._id,
        latestAgentReply: null,
      },

      {
        ticketId: "HD-10006",
        customer: {
          name: "William Taylor",
          email: "william@example.com",
        },
        subject: "Feature request",
        body:
          "It would be useful to have an option to export account activity.",
        priority: "LOW",
        status: "OPEN",
        assignee: null,
        latestAgentReply: null,
      },

      {
        ticketId: "HD-10007",
        customer: {
          name: "Sophia Anderson",
          email: "sophia@example.com",
        },
        subject: "API returning an error",
        body:
          "Our integration started returning server errors when creating a request.",
        priority: "URGENT",
        status: "RESOLVED",
        assignee: agent1._id,
        latestAgentReply:
          "The issue has been resolved. Please try the request again.",
      },

      {
        ticketId: "HD-10008",
        customer: {
          name: "James Thomas",
          email: "james@example.com",
        },
        subject: "Account locked",
        body:
          "My account appears to be locked after several unsuccessful login attempts.",
        priority: "HIGH",
        status: "CLOSED",
        assignee: agent2._id,
        latestAgentReply:
          "Your account has been unlocked and should now be accessible.",
      },

      {
        ticketId: "HD-10009",
        customer: {
          name: "Ava Jackson",
          email: "ava@example.com",
        },
        subject: "Email notifications delayed",
        body:
          "Notifications are arriving several hours after the related activity.",
        priority: "MEDIUM",
        status: "OPEN",
        assignee: agent1._id,
        latestAgentReply: null,
      },

      {
        ticketId: "HD-10010",
        customer: {
          name: "Benjamin White",
          email: "benjamin@example.com",
        },
        subject: "Unable to upload document",
        body:
          "The document upload fails whenever I try to submit a PDF file.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignee: null,
        latestAgentReply: null,
      },
    ]);

    logger.info(
      {
        ticketCount: tickets.length,
      },
      "Demo tickets created",
    );

    /*
     * Create timeline events.
     *
     * Every ticket gets a CREATED event.
     *
     * Assigned tickets also get a REASSIGNED event.
     *
     * Tickets containing a seeded agent reply get a REPLIED event.
     *
     * Tickets whose status is not OPEN get a STATUS_CHANGED event.
     */
    const events = [];

    for (const ticket of tickets) {
      events.push({
        ticketId: ticket._id,
        type: "CREATED" as const,
        actor: null,
        metadata: {},
      });

      if (ticket.assignee) {
        events.push({
          ticketId: ticket._id,
          type: "REASSIGNED" as const,
          actor: ticket.assignee,
          metadata: {
            from: null,
            to: ticket.assignee.toString(),
          },
        });
      }

      if (ticket.latestAgentReply) {
        events.push({
          ticketId: ticket._id,
          type: "REPLIED" as const,
          actor: ticket.assignee,
          metadata: {
            reply: ticket.latestAgentReply,
          },
        });
      }

      if (ticket.status !== "OPEN") {
        events.push({
          ticketId: ticket._id,
          type: "STATUS_CHANGED" as const,
          actor: ticket.assignee,
          metadata: {
            from: "OPEN",
            to: ticket.status,
          },
        });
      }
    }

    await TicketEventModel.insertMany(events);

    logger.info(
      {
        eventCount: events.length,
      },
      "Demo ticket events created",
    );

    logger.info(
      {
        accounts: {
          agent1: "agent1@example.com",
          agent2: "agent2@example.com",
          admin: "admin@example.com",
        },
        password: DEMO_PASSWORD,
      },
      "Demo credentials",
    );

    logger.info("Database seed completed successfully");
  } catch (error) {
    logger.error(
      { err: error },
      "Database seed failed",
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    logger.info("Disconnected from MongoDB");
  }
};

void seed();