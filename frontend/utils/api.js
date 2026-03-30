const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiFetch(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = "include",
    signal,
    ...rest
  } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  return response;
}
