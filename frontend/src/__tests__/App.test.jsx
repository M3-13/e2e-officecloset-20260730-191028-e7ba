import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

describe("App routing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders home page at /", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
  });

  it("renders login page at /login", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    });
  });

  it("renders register page at /register", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Der rote Teppich erwartet dich")).toBeInTheDocument();
    });
  });

  it("renders privacy page at /privacy", async () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Privacy Page")).toBeInTheDocument();
    });
  });

  it("redirects /wardrobe to login when not authenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/wardrobe"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    });
  });

  it("redirects /outfits to login when not authenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/outfits"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    });
  });

  it("redirects /outfits/new to login when not authenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/outfits/new"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    });
  });

  it("redirects /profile to login when not authenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Willkommen zurück")).toBeInTheDocument();
    });
  });

  it("allows access to protected routes when authenticated", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("username", "testuser");

    render(
      <MemoryRouter initialEntries={["/wardrobe"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Wardrobe Page")).toBeInTheDocument();
    });
  });
});
