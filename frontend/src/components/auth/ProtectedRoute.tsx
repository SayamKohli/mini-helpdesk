import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};