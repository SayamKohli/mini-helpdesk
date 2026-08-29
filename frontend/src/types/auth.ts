export type UserRole = "agent" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  status: "success";
  data: {
    agent: AuthUser;
  };
};

export type MeResponse = AuthResponse;

export type LogoutResponse = {
  status: "success";
  data?: unknown;
};