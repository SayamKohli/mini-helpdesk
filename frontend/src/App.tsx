import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import { LoginPage } from "./pages/LoginPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { NewTicketPage } from "./pages/NewTicketPage";
import { TicketsStatusPage } from "./pages/TicketStatusPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}

          <Route
            path="/"
            element={
              <Navigate
                to="/submit-ticket"
                replace
              />
            }
          />

          <Route
            path="/submit-ticket"
            element={<NewTicketPage />}
          />

          <Route
            path="/check-status"
            element={<TicketsStatusPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Protected agent routes */}

          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TicketsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TicketDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Unknown route */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;