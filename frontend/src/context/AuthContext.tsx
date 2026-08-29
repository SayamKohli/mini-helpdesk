import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/auth.service";

import type {
  AuthUser,
  LoginInput,
} from "../types/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      try {
        const response = await getMe();

        console.log("GET ME RESPONSE:", response);

        setUser(response.data.agent);
      } catch (error) {
        console.error("GET ME FAILED:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  const login = async (
    input: LoginInput,
  ): Promise<void> => {
    console.log("LOGIN START");

    const response = await loginRequest(input);

    console.log("LOGIN RESPONSE:", response);
    console.log("LOGIN AGENT:", response.data.agent);

    setUser(response.data.agent);

    console.log("LOGIN USER SET:", response.data.agent);
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};