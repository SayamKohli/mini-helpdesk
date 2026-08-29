import { AgentModel } from "../models/Agent";

export const listAgents = async () => {
  const agents = await AgentModel.find({
    role: "agent",
  })
    .select("name email role")
    .sort({ name: 1 })
    .lean();

  return agents.map((agent) => ({
    id: agent._id.toString(),
    name: agent.name,
    email: agent.email,
    role: agent.role,
  }));
};