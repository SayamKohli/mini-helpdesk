import { api } from "./api";

import type {
  AuthResponse,
  LoginInput,
  LogoutResponse,
  MeResponse,
} from "../types/auth";

export const login = async (
  input: LoginInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    input,
  );

  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>(
    "/auth/me",
  );

  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>(
    "/auth/logout",
  );

  return response.data;
};