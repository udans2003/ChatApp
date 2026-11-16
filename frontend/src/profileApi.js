
const API_URL = "http://localhost:5000/api/profile";

function getToken() {
  return sessionStorage.getItem("chatwave-token");
}

async function profileRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function getMyProfile() {
  return profileRequest("/me");
}

export function updateMyProfile(username) {
  return profileRequest("/me", {
    method: "PATCH",
    body: JSON.stringify({ username }),
  });
}
