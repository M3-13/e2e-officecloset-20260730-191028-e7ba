import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WardrobePage from "./WardrobePage";

const mockItems = [
  {
    id: 1,
    name: "Schwarze Jacke",
    category: "jacken",
    image_path: "uploads/1.jpg",
  },
  {
    id: 2,
    name: "Blaue Jeans",
    category: "hosen",
    image_path: "uploads/2.jpg",
  },
  {
    id: 3,
    name: "Weißes Hemd",
    category: "oberteile",
    image_path: "uploads/3.jpg",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <WardrobePage />
    </MemoryRouter>,
  );
}

describe("WardrobePage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the page title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderPage();
    expect(screen.getByText("Garderobe")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Noch keine Kleidungsstücke/)).toBeInTheDocument();
    });
  });

  it("renders all category filter buttons", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderPage();
    expect(screen.getByRole("button", { name: "Alle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oberteile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hosen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Röcke" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kleider" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jacken" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schuhe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accessoires" })).toBeInTheDocument();
  });

  it("renders items loaded from API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    });
    expect(screen.getByText("Blaue Jeans")).toBeInTheDocument();
    expect(screen.getByText("Weißes Hemd")).toBeInTheDocument();
  });

  it("filters items by category when pill is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Jacken" }));

    expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    expect(screen.queryByText("Blaue Jeans")).not.toBeInTheDocument();
    expect(screen.queryByText("Weißes Hemd")).not.toBeInTheDocument();
  });

  it("shows all items when 'Alle' filter is selected", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockItems),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Jacken" }));
    await userEvent.click(screen.getByRole("button", { name: "Alle" }));

    expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    expect(screen.getByText("Blaue Jeans")).toBeInTheDocument();
    expect(screen.getByText("Weißes Hemd")).toBeInTheDocument();
  });

  it("opens upload form when Upload button is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderPage();

    await userEvent.click(screen.getByText("+ Upload"));

    expect(screen.getByText("Neues Kleidungsstück")).toBeInTheDocument();
  });

  it("shows error when API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: "Server error" }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("deletes an item", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Löschen");
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Schwarze Jacke")).not.toBeInTheDocument();
    });
  });

  it("shows error when delete fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Delete failed" }),
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByText("Löschen")[0]);

    await waitFor(() => {
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });
  });
});
