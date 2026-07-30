import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WardrobeGrid from "./WardrobeGrid";

const sampleItems = [
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
    name: "Rotes Kleid",
    category: "kleider",
    image_path: "uploads/3.jpg",
  },
];

describe("WardrobeGrid", () => {
  it("renders empty message when no items", () => {
    render(<WardrobeGrid items={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/Noch keine Kleidungsstücke/)).toBeInTheDocument();
  });

  it("renders empty message when items is null", () => {
    render(<WardrobeGrid items={null} onDelete={vi.fn()} />);
    expect(screen.getByText(/Noch keine Kleidungsstücke/)).toBeInTheDocument();
  });

  it("renders all items with names and category badges", () => {
    render(<WardrobeGrid items={sampleItems} onDelete={vi.fn()} />);
    expect(screen.getByText("Schwarze Jacke")).toBeInTheDocument();
    expect(screen.getByText("Blaue Jeans")).toBeInTheDocument();
    expect(screen.getByText("Rotes Kleid")).toBeInTheDocument();
    expect(screen.getByText("Jacken")).toBeInTheDocument();
    expect(screen.getByText("Hosen")).toBeInTheDocument();
    expect(screen.getByText("Kleider")).toBeInTheDocument();
  });

  it("renders delete buttons for each item", () => {
    render(<WardrobeGrid items={sampleItems} onDelete={vi.fn()} />);
    const buttons = screen.getAllByText("Löschen");
    expect(buttons).toHaveLength(3);
  });

  it("calls onDelete with item id when delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<WardrobeGrid items={sampleItems} onDelete={onDelete} />);
    const buttons = screen.getAllByText("Löschen");
    await userEvent.click(buttons[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("renders images with correct src", () => {
    render(<WardrobeGrid items={sampleItems} onDelete={vi.fn()} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute(
      "src",
      "http://localhost:8000/uploads/1.jpg",
    );
  });

  it("renders category badge with fallback for unknown category", () => {
    const items = [
      { id: 5, name: "Unbekannt", category: "mystery", image_path: "x.jpg" },
    ];
    render(<WardrobeGrid items={items} onDelete={vi.fn()} />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});
