// Thin fetch wrapper that attaches the access token, automatically refreshes
// it once on a 401, and surfaces backend error messages.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Ask the backend for a new access token using the httpOnly refresh cookie.
export const refreshSession = async () => {
  const res = await fetch(`${API_URL}/users/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  accessToken = data.accessToken;
  return data;
};

const buildHeaders = (hasBody) => {
  const headers = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// Core request function. Retries once after refreshing on a 401.
const request = async (path, { method = "GET", body, _retried } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: buildHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_retried && !path.startsWith("/users/refresh")) {
    try {
      await refreshSession();
      return request(path, { method, body, _retried: true });
    } catch {
      // fall through to throw the original 401 below
    }
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
};

export const api = {
  // --- Auth ---
  register: (payload) =>
    request("/users/register", { method: "POST", body: payload }),
  login: (payload) =>
    request("/users/login", { method: "POST", body: payload }),
  googleLogin: (credential) =>
    request("/users/google", { method: "POST", body: { credential } }),
  logout: () => request("/users/logout", { method: "POST" }),
  current: () => request("/users/current"),

  // --- Contacts ---
  getContacts: () => request("/contacts"),
  createContact: (payload) =>
    request("/contacts", { method: "POST", body: payload }),
  updateContact: (id, payload) =>
    request(`/contacts/${id}`, { method: "PUT", body: payload }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: "DELETE" }),
};
