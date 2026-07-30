import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import * as authApi from "../api/auth";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form", () => {
    renderLoginPage();

    expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    expect(screen.getByLabelText("Benutzername")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeInTheDocument();
  });

  it("shows link to register page", () => {
    renderLoginPage();

    const link = screen.getByText("Jetzt registrieren");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/register");
  });

  it("shows error for empty fields", async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => {
      expect(screen.getByText("Bitte Benutzernamen und Passwort eingeben.")).toBeInTheDocument();
    });
  });

  it("calls login on submit and shows error on failure", async () => {
    authApi.login.mockRejectedValue(new Error("Login fehlgeschlagen."));

    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("testuser", "password123");
    });

    await waitFor(() => {
      expect(screen.getByText("Login fehlgeschlagen.")).toBeInTheDocument();
    });
  });

  it("redirects to /wardrobe when already logged in", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "testuser");

    renderLoginPage();

    await waitFor(() => {
      expect(screen.queryByLabelText("Benutzername")).not.toBeInTheDocument();
    });
  });

  it("redirects to /wardrobe after successful login", async () => {
    authApi.login.mockResolvedValue({ access_token: "jwt-token", token_type: "bearer" });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("testuser", "password123");
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Benutzername")).not.toBeInTheDocument();
    });
  });
});
