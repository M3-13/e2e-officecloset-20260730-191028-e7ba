import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemUploadForm from "./ItemUploadForm";

describe("ItemUploadForm", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <ItemUploadForm open={false} onClose={vi.fn()} onCreated={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the form when open is true", () => {
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />,
    );
    expect(screen.getByText("Neues Kleidungsstück")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Kategorie")).toBeInTheDocument();
    expect(screen.getByLabelText("Bild")).toBeInTheDocument();
  });

  it("renders all 7 category options plus placeholder", () => {
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />,
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(8);
    expect(options[0]).toHaveTextContent("Bitte wählen…");
  });

  it("closes when overlay is clicked", async () => {
    const onClose = vi.fn();
    render(
      <ItemUploadForm open={true} onClose={onClose} onCreated={vi.fn()} />,
    );
    await userEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when Cancel button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <ItemUploadForm open={true} onClose={onClose} onCreated={vi.fn()} />,
    );
    await userEvent.click(screen.getByText("Abbrechen"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />,
    );
    await userEvent.click(screen.getByText("Upload"));
    expect(screen.getByText("Name ist erforderlich.")).toBeInTheDocument();
    expect(screen.getByText("Bitte wähle eine Kategorie.")).toBeInTheDocument();
    expect(
      screen.getByText("Bitte wähle eine Bilddatei aus."),
    ).toBeInTheDocument();
  });

  it("validates name max length", async () => {
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />,
    );
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "a".repeat(101) } });
    await userEvent.click(screen.getByText("Upload"));
    expect(
      screen.getByText("Name darf maximal 100 Zeichen lang sein."),
    ).toBeInTheDocument();
  });

  it("validates image file type when other fields are valid", async () => {
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={vi.fn()} />,
    );

    const nameInput = screen.getByLabelText("Name");
    await userEvent.type(nameInput, "Gültiger Name");
    await userEvent.selectOptions(screen.getByLabelText("Kategorie"), "jacken");

    const file = new File(["dummy"], "test.gif", { type: "image/gif" });
    const fileInput = screen.getByLabelText("Bild");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByAltText("Vorschau")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Upload"));
    expect(
      screen.getByText("Nur JPEG- und PNG-Dateien sind erlaubt."),
    ).toBeInTheDocument();
  });

  it("calls onCreated with form data on valid submit", async () => {
    const onCreated = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test",
      category: "jacken",
      image_path: "u/1.jpg",
    });
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={onCreated} />,
    );

    await userEvent.type(screen.getByLabelText("Name"), "Test");
    await userEvent.selectOptions(screen.getByLabelText("Kategorie"), "jacken");

    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(screen.getByLabelText("Bild"), file);

    await userEvent.click(screen.getByText("Upload"));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });

    const formData = onCreated.mock.calls[0][0];
    expect(formData.get("name")).toBe("Test");
    expect(formData.get("category")).toBe("jacken");
    expect(formData.get("image")).toBe(file);
  });

  it("shows error when onCreated throws", async () => {
    const onCreated = vi.fn().mockRejectedValue(new Error("Upload failed"));
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={onCreated} />,
    );

    await userEvent.type(screen.getByLabelText("Name"), "Test");
    await userEvent.selectOptions(screen.getByLabelText("Kategorie"), "jacken");

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Bild"), file);

    await userEvent.click(screen.getByText("Upload"));

    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });
  });

  it("disables buttons while uploading", async () => {
    let resolvePromise;
    const onCreated = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );
    render(
      <ItemUploadForm open={true} onClose={vi.fn()} onCreated={onCreated} />,
    );

    await userEvent.type(screen.getByLabelText("Name"), "Test");
    await userEvent.selectOptions(screen.getByLabelText("Kategorie"), "jacken");

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Bild"), file);

    await userEvent.click(screen.getByText("Upload"));

    await waitFor(() => {
      expect(screen.getByText("Lädt…")).toBeDisabled();
    });

    resolvePromise({
      id: 1,
      name: "Test",
      category: "jacken",
      image_path: "u/1.jpg",
    });
  });
});
