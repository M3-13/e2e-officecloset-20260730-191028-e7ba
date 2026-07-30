import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth, ProtectedRoute } from "../contexts/AuthContext";
import * as authApi from "../api/auth";

vi.mock("../api/auth", () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

function TestConsumer() {
  const ctx = useAuth();
  return (
    <div>
      <span data-testid="username">{ctx.user?.username || "none"}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <button
        data-testid="login-btn"
        onClick={() => ctx.login("testuser", "password123")}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={() => ctx.register("newuser", "password123")}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={ctx.logout}>
        Logout
      </button>
    </div>
  );
}

function renderWithProvider(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("starts with no user and loading false", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("username")).toHaveTextContent("none");
  });

  it("restores user from localStorage on mount", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "storeduser");

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("storeduser");
    });
  });

  it("login stores token and sets user", async () => {
    authApi.login.mockResolvedValue({ access_token: "jwt-token", token_type: "bearer" });

    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("testuser");
    });
    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(localStorage.getItem("username")).toBe("testuser");
  });

  it("login propagates errors", async () => {
    authApi.login.mockRejectedValue(new Error("Invalid credentials"));

    let errorThrown = null;
    function ThrowingConsumer() {
      const ctx = useAuth();
      return (
        <button
          data-testid="login-btn"
          onClick={async () => {
            try {
              await ctx.login("testuser", "wrong");
            } catch (e) {
              errorThrown = e.message;
            }
          }}
        >
          Login
        </button>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <ThrowingConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(errorThrown).toBe("Invalid credentials");
    });
  });

  it("register calls API then auto-login", async () => {
    authApi.register.mockResolvedValue({ id: 2, username: "newuser", created_at: "2024-01-01T00:00:00Z" });
    authApi.login.mockResolvedValue({ access_token: "jwt-token", token_type: "bearer" });

    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByTestId("register-btn"));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith("newuser", "password123");
      expect(authApi.login).toHaveBeenCalledWith("newuser", "password123");
      expect(screen.getByTestId("username")).toHaveTextContent("newuser");
    });
  });

  it("logout clears user and localStorage", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "storeduser");

    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("storeduser");
    });

    await userEvent.click(screen.getByTestId("logout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("none");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
  });
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("redirects to /login when not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/wardrobe"]}>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "testuser");

    render(
      <MemoryRouter initialEntries={["/wardrobe"]}>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected")).toBeInTheDocument();
    });
  });
});
