export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_ON_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketAssignee = {
  id: string;
  name: string;
  email: string;
};

export type TicketCustomer = {
  name: string;
  email: string;
};

export type TicketListItem = {
  id: string;
  ticketId: string;
  customer: TicketCustomer;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: TicketAssignee | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
};

export type TicketPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TicketListResponse = {
  status: "success";
  data: {
    tickets: TicketListItem[];
    pagination: TicketPagination;
  };
};

export type TicketTimelineEvent = {
  id: string;
  type:
    | "CREATED"
    | "REASSIGNED"
    | "REPLIED"
    | "STATUS_CHANGED";
  actor: TicketAssignee | null;
  metadata?: {
  from?: string | null;
  to?: string | null;
  previousStatus?: TicketStatus;
  status?: TicketStatus;
  reply?: string;
};
  createdAt: string;
};

export type TicketDetail = {
  id: string;
  ticketId: string;
  customer: TicketCustomer;
  subject: string;
  body: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: TicketAssignee | null;
  latestAgentReply: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetailResponse = {
  status: "success";
  data: {
    ticket: TicketDetail;
    timeline: TicketTimelineEvent[];
  };
};

export type CreateTicketInput = {
  name: string;
  email: string;
  subject: string;
  body: string;
  priority: TicketPriority;
};

export type CreateTicketResponse = {
  status: "success";
  data: {
    ticketId: string;
  };
};

export type ReplyTicketInput = {
  message: string;
};

export type ReplyTicketResponse = {
  status: "success";
  data: {
    ticketId: string;
    latestAgentReply: string;
  };
};

export type UpdateTicketStatusInput = {
  status: TicketStatus;
};

export type UpdateTicketStatusResponse = {
  status: "success";
  data: {
    ticketId: string;
    previousStatus: TicketStatus;
    status: TicketStatus;
  };
};

export type AssignTicketInput = {
  assigneeId: string | null;
};

export type AssignTicketResponse = {
  status: "success";
  data: {
    ticketId: string;
    assignee: TicketAssignee | null;
  };
};

export type PublicTicketStatusResponse = {
  status: "success";
  data: {
    ticketId: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    latestAgentReply: string | null;
    createdAt: string;
    updatedAt: string;
  };
};