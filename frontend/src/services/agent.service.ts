import { api } from "./api";

export type Agent = {
  id: string;
  name: string;
  email: string;
  role: "agent" | "admin";
};

export type AgentsResponse = {
  status: "success";
  data: {
    agents: Agent[];
  };
};

export const getAgents = async (): Promise<AgentsResponse> => {
  const response = await api.get<AgentsResponse>("/agents");

  return response.data;
};