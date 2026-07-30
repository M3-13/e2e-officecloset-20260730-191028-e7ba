import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getItems, createItem, deleteItem } from "./items";

const API_BASE = "http://localhost:8000";

describe("items API", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "test-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getItems", () => {
    it("fetches all items without category filter", async () => {
      const mockItems = [
        { id: 1, name: "Jacke", category: "jacken", image_path: "u/1.jpg" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems),
      });

      const result = await getItems();
      expect(result).toEqual(mockItems);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/items`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("fetches items with category filter", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getItems("jacken");
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/items?category=jacken`,
        expect.anything(),
      );
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Server error" }),
      });

      await expect(getItems()).rejects.toThrow("Server error");
    });
  });

  describe("createItem", () => {
    it("posts form data and returns created item", async () => {
      const newItem = { id: 2, name: "Hemd", category: "oberteile", image_path: "u/2.jpg" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newItem),
      });

      const formData = new FormData();
      formData.append("name", "Hemd");
      formData.append("category", "oberteile");

      const result = await createItem(formData);
      expect(result).toEqual(newItem);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/items`,
        expect.objectContaining({
          method: "POST",
          body: formData,
        }),
      );
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ detail: "Invalid category" }),
      });

      const formData = new FormData();
      await expect(createItem(formData)).rejects.toThrow("Invalid category");
    });
  });

  describe("deleteItem", () => {
    it("deletes an item by id", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
      });

      await deleteItem(42);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/items/42`,
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      });

      await expect(deleteItem(99)).rejects.toThrow("Not found");
    });
  });
});
