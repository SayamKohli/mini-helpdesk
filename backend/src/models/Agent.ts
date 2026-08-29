import { Schema, model, type InferSchemaType } from "mongoose";

export const AGENT_ROLES = ["agent", "admin"] as const;

const agentSchema = new Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      required: true,
      enum: AGENT_ROLES,
      default: "agent",
    },
  },
  {
    timestamps: true,
  },
);

export type Agent = InferSchemaType<typeof agentSchema>;

export const AgentModel = model<Agent>("Agent", agentSchema);