import { api } from "./api";

import type {
  AssignTicketInput,
  AssignTicketResponse,
  CreateTicketInput,
  CreateTicketResponse,
  ReplyTicketInput,
  ReplyTicketResponse,
  TicketDetailResponse,
  TicketListQuery,
  TicketListResponse,
  UpdateTicketStatusInput,
  UpdateTicketStatusResponse,
  PublicTicketStatusResponse,
} from "../types/ticket";

export const getTickets = async (
  query: TicketListQuery = {},
): Promise<TicketListResponse> => {
  const response = await api.get<TicketListResponse>(
    "/tickets",
    {
      params: query,
    },
  );

  return response.data;
};

export const createTicket = async (
  input: CreateTicketInput,
): Promise<CreateTicketResponse> => {
  const response =
    await api.post<CreateTicketResponse>(
      "/tickets",
      input,
    );

  return response.data;
};

export const getTicketDetail = async (
  ticketId: string,
): Promise<TicketDetailResponse> => {
  const response =
    await api.get<TicketDetailResponse>(
      `/tickets/${ticketId}`,
    );

  return response.data;
};

export const replyToTicket = async (
  ticketId: string,
  input: ReplyTicketInput,
): Promise<ReplyTicketResponse> => {
  const response =
    await api.post<ReplyTicketResponse>(
      `/tickets/${ticketId}/reply`,
      input,
    );

  return response.data;
};

export const updateTicketStatus = async (
  ticketId: string,
  input: UpdateTicketStatusInput,
): Promise<UpdateTicketStatusResponse> => {
  const response =
    await api.patch<UpdateTicketStatusResponse>(
      `/tickets/${ticketId}/status`,
      input,
    );

  return response.data;
};

export const assignTicket = async (
  ticketId: string,
  input: AssignTicketInput,
): Promise<AssignTicketResponse> => {
  const response =
    await api.patch<AssignTicketResponse>(
      `/tickets/${ticketId}/assignee`,
      input,
    );

  return response.data;
};

export const getPublicTicketStatus = async (
  ticketId: string,
  email: string,
): Promise<PublicTicketStatusResponse> => {
  const response =
    await api.get<PublicTicketStatusResponse>(
      `/tickets/${encodeURIComponent(ticketId)}/status`,
      {
        params: {
          email,
        },
      },
    );

  return response.data;
};