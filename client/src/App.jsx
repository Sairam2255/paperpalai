import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Bills from "./pages/Bills";
import Career from "./pages/Career";
import Learn from "./pages/Learn";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import DocumentDetails from "./pages/DocumentDetails";
import Chat from "./pages/Chat";

import ProtectedRoute from "./components/ProtectedRoute";

import "./theme.css";

function ThemeBootstrap() {
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme =
        localStorage.getItem("paperpal-theme") === "dark"
          ? "dark"
          : "light";

      document.documentElement.dataset.theme = savedTheme;
      document.body.dataset.theme = savedTheme;
    };

    applyTheme();

    const handler = (event) => {
      const nextTheme =
        event.detail?.theme ||
        localStorage.getItem("paperpal-theme") ||
        "light";

      const safeTheme =
        nextTheme === "dark" ? "dark" : "light";

      document.documentElement.dataset.theme = safeTheme;
      document.body.dataset.theme = safeTheme;
    };

    window.addEventListener(
      "paperpal-settings-changed",
      handler
    );

    return () => {
      window.removeEventListener(
        "paperpal-settings-changed",
        handler
      );
    };
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeBootstrap />

      <Routes>
        {/* ================================
            AUTH
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* ================================
            DEFAULT
        ================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

        {/* ================================
            APP
        ================================= */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <Career />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <DocumentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* ================================
            OLD DASHBOARD URL
            Keep it only as a redirect.
        ================================= */}

        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

        {/* ================================
            FALLBACK
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;