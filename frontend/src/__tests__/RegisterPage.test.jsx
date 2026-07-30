import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import RegisterPage from "../pages/RegisterPage";
import * as authApi from "../api/auth";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders registration form", () => {
    renderRegisterPage();

    expect(screen.getByText("Der rote Teppich erwartet dich")).toBeInTheDocument();
    expect(screen.getByLabelText("Benutzername")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort wiederholen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrieren" })).toBeInTheDocument();
  });

  it("shows link to login page", () => {
    renderRegisterPage();

    const link = screen.getByText("Jetzt anmelden");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/login");
  });

  it("validates empty username", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(screen.getByText("Bitte einen Benutzernamen eingeben.")).toBeInTheDocument();
    });
  });

  it("validates username too short", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "ab");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(screen.getByText("Benutzername muss mindestens 3 Zeichen lang sein.")).toBeInTheDocument();
    });
  });

  it("validates password too short", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "1234567");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "1234567");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(screen.getByText("Passwort muss mindestens 8 Zeichen lang sein.")).toBeInTheDocument();
    });
  });

  it("validates password mismatch", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "differentpass");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(screen.getByText("Passwörter stimmen nicht überein.")).toBeInTheDocument();
    });
  });

  it("calls register and auto-login on success", async () => {
    authApi.register.mockResolvedValue({ id: 2, username: "testuser", created_at: "2024-01-01T00:00:00Z" });
    authApi.login.mockResolvedValue({ access_token: "jwt-token", token_type: "bearer" });

    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith("testuser", "password123");
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Benutzername")).not.toBeInTheDocument();
    });
  });

  it("shows error from API", async () => {
    authApi.register.mockRejectedValue(new Error("Registrierung fehlgeschlagen."));

    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Benutzername"), "testuser");
    await userEvent.type(screen.getByLabelText("Passwort"), "password123");
    await userEvent.type(screen.getByLabelText("Passwort wiederholen"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => {
      expect(screen.getByText("Registrierung fehlgeschlagen.")).toBeInTheDocument();
    });
  });

  it("redirects to /wardrobe when already logged in", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "testuser");

    renderRegisterPage();

    await waitFor(() => {
      expect(screen.queryByLabelText("Benutzername")).not.toBeInTheDocument();
    });
  });
});
