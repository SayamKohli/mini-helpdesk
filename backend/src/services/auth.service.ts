import argon2 from "argon2";

import { AgentModel } from "../models/Agent";
import { signAuthToken } from "../utils/jwt";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  agent: {
    id: string;
    name: string;
    email: string;
    role: "agent" | "admin";
  };
};

export const login = async (
  input: LoginInput,
): Promise<LoginResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const agent = await AgentModel.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  /*
   * Use the same error for an unknown email and an incorrect password.
   * This prevents leaking whether an account exists.
   */
  if (!agent) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await argon2.verify(
    agent.passwordHash,
    input.password,
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const token = signAuthToken({
    sub: agent._id.toString(),
    role: agent.role,
  });

  return {
    token,
    agent: {
      id: agent._id.toString(),
      name: agent.name,
      email: agent.email,
      role: agent.role,
    },
  };
};