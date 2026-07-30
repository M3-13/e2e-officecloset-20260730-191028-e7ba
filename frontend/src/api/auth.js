import { apiPost } from "./client";

export async function register(username, password) {
  return apiPost("/api/auth/register", { username, password });
}

export async function login(username, password) {
  return apiPost("/api/auth/login", { username, password });
}
