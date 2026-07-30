import { apiDelete, apiGet, apiUpload } from "./client";

const BASE = "/api/items";

export async function getItems(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiGet(`${BASE}${query}`);
}

export async function createItem(formData) {
  return apiUpload(BASE, formData);
}

export async function deleteItem(id) {
  return apiDelete(`${BASE}/${id}`);
}
