
const API_URL = "http://localhost:5000/api";

function getToken() {
  return sessionStorage.getItem("chatwave-token");
}

async function apiRequest(path, options = {}) {
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
    throw new Error(
      `Server returned a non-JSON response (HTTP ${response.status}). Check the backend API URL and route.`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Get all registered users except yourself
export function getUsers() {
  return apiRequest("/users");
}

// Create or retrieve a conversation
export function createConversation(receiverId) {
  return apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  });
}

// Get your existing private conversations
export function getConversations() {
  return apiRequest("/conversations");
}

// Get previous messages in a conversation
export function getPrivateMessages(conversationId) {
  return apiRequest(
    `/conversations/${conversationId}/messages`
  );
}

// Mark received messages in a conversation as read
export function markConversationRead(conversationId) {
  return apiRequest(
    `/conversations/${conversationId}/read`,
    {
      method: "PATCH",
    }
  );
}



export async function editPrivateMessage(
  conversationId,
  messageId,
  text
) {
  const token = sessionStorage.getItem("chatwave-token");

  const response = await fetch(
    `http://localhost:5000/api/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    }
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    console.error("Unexpected server response:", responseText);

    throw new Error(
      `Server returned non-JSON response (HTTP ${response.status}). Check the backend API URL and route.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to edit message"
    );
  }

  return data;
}


export async function deletePrivateMessage(
  conversationId,
  messageId
) {
  const token = sessionStorage.getItem("chatwave-token");

  const response = await fetch(
    `http://localhost:5000/api/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete message");
  }

  return data;
}

