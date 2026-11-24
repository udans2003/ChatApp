
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

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    if (response.status === 413) {
      throw new Error(
        "Profile picture is too large. Choose an image smaller than 2 MB."
      );
    }

    throw new Error(
      `Server returned a non-JSON response (HTTP ${response.status}). Check that the backend server is running.`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function getMyProfile() {
  return profileRequest("/me");
}

export function updateMyProfile(username, profilePicture) {
  return profileRequest("/me", {
    method: "PATCH",
    body: JSON.stringify({ username, profilePicture }),
  });
}
