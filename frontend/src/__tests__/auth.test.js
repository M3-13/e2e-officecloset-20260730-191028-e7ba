import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login } from "../api/auth";
import * as client from "../api/client";

vi.mock("../api/client", () => ({
  apiPost: vi.fn(),
}));

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("calls apiPost with correct endpoint and body", async () => {
      const mockResponse = { id: 1, username: "testuser", created_at: "2024-01-01T00:00:00Z" };
      client.apiPost.mockResolvedValue(mockResponse);

      const result = await register("testuser", "password123");

      expect(client.apiPost).toHaveBeenCalledWith("/api/auth/register", {
        username: "testuser",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("propagates API errors", async () => {
      client.apiPost.mockRejectedValue(new Error("Username already exists"));

      await expect(register("testuser", "password123")).rejects.toThrow("Username already exists");
    });
  });

  describe("login", () => {
    it("calls apiPost with correct endpoint and body", async () => {
      const mockResponse = { access_token: "jwt-token", token_type: "bearer" };
      client.apiPost.mockResolvedValue(mockResponse);

      const result = await login("testuser", "password123");

      expect(client.apiPost).toHaveBeenCalledWith("/api/auth/login", {
        username: "testuser",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("propagates API errors", async () => {
      client.apiPost.mockRejectedValue(new Error("Invalid credentials"));

      await expect(login("testuser", "wrong")).rejects.toThrow("Invalid credentials");
    });
  });
});
