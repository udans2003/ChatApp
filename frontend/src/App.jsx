
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Auth from "./components/Auth";
import ChatHeader from "./components/ChatHeader";
import ChatSidebar from "./components/ChatSidebar";
import MessageList from "./components/MessageList";
import MessageComposer from "./components/MessageComposer";
import ConversationHeader from "./components/ConversationHeader";
import ProfilePanel from "./profilePanel";
import "./chatwave-ui.css";

import {
  getUsers,
  getConversations,
  createConversation,
  getPrivateMessages,
  markConversationRead,
  editPrivateMessage,
  deletePrivateMessage,
} from "./services/chatApi";

import "./App.css";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});


function App() {
  const [username, setUsername] = useState(
    () => sessionStorage.getItem("chatwave-username") || ""
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("chatwave-user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const [typingUser, setTypingUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [selectedChat, setSelectedChat] = useState("general");
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messageMenuId, setMessageMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [messageActionLoading, setMessageActionLoading] =
  useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  const typingTimeoutRef = useRef(null);
  const typingSentRef = useRef(false);
  const typingConversationRef = useRef(null);
  const incomingTypingTimeoutRef = useRef(null);
  const incomingTypingRequestRef = useRef(0);
  const receiptRefreshRef = useRef(Promise.resolve());
  const activeUserId = currentUser?.id || currentUser?._id;



function handleProfileUpdated(data) {
  const updatedUser = data.user;

  stopTyping();

  if (data.token) {
    sessionStorage.setItem("chatwave-token", data.token);
  }

  setCurrentUser((previous) => ({
    ...previous,
    ...updatedUser,
  }));

  setUsername(updatedUser.username);

  sessionStorage.setItem(
    "chatwave-user",
    JSON.stringify({
      ...currentUser,
      ...updatedUser,
    })
  );

  sessionStorage.setItem(
    "chatwave-username",
    updatedUser.username
  );
}


function isUserOnline(userId) {
  if (!userId) return false;

  return onlineUserIds.includes(String(userId));
}

const sortedUsers = [...users].sort((userA, userB) => {
  function findConversation(userId) {
    return conversations.find((conversation) =>
      conversation.participants.some(
        (participant) =>
          String(participant._id) === String(userId)
      )
    );
  }

  const conversationA = findConversation(userA.id);
  const conversationB = findConversation(userB.id);

  const timeA = conversationA?.lastMessageAt
    ? new Date(conversationA.lastMessageAt).getTime()
    : 0;

  const timeB = conversationB?.lastMessageAt
    ? new Date(conversationB.lastMessageAt).getTime()
    : 0;

  return timeB - timeA;
});


  async function refreshConversations() {
  try {
    const data = await getConversations();

    setConversations(data.conversations || []);
  } catch (error) {
    console.error(
      "Could not refresh conversations:",
      error
    );
  }
}

  
async function refreshPrivateReadReceipts(conversationId) {
  const refresh = async () => {
    if (
      String(selectedChatRef.current) !==
      String(conversationId)
    ) {
      return;
    }

    try {
      const result = await getPrivateMessages(conversationId);

      if (
        String(selectedChatRef.current) !==
        String(conversationId)
      ) {
        return;
      }

      // Read the latest status from MongoDB.
      const readStatusById = new Map(
        (result.messages || []).map((message) => [
          String(message._id),
          message.read === true,
        ])
      );

      setPrivateMessages((previous) =>
        previous.map((message) => {
          const messageId = String(
            message.id || message._id
          );

          if (!readStatusById.has(messageId)) {
            return message;
          }

          return {
            ...message,
            read:
              message.read === true ||
              readStatusById.get(messageId),
          };
        })
      );
    } catch (error) {
      console.error(
        "Could not refresh read receipts:",
        error
      );
    }
  };

  // Process receipt refreshes sequentially.
  receiptRefreshRef.current =
    receiptRefreshRef.current.then(refresh, refresh);

  return receiptRefreshRef.current;
}


  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  function handleAuthSuccess(data) {
    sessionStorage.setItem("chatwave-token", data.token);
    sessionStorage.setItem(
      "chatwave-username",
      data.user.username
    );
    sessionStorage.setItem(
      "chatwave-user",
      JSON.stringify(data.user)
    );

    setCurrentUser(data.user);
    setUsername(data.user.username);
    setError("");
  }

  function handleLogout() {
    stopTyping();
    setTypingUser(null);
    socket.disconnect();

    setOnlineUserIds([]);

    sessionStorage.removeItem("chatwave-token");
    sessionStorage.removeItem("chatwave-username");
    sessionStorage.removeItem("chatwave-user");

    setUsername("");
    setCurrentUser(null);
    setConnected(false);
    setMessages([]);
    setPrivateMessages([]);
    setOnlineUsers([]);
    setUsers([]);
    setConversations([]);
    setSelectedChat("general");
    setSelectedConversation(null);
    setMessageInput("");
    setError("");
  }

  // Load registered users and conversations
  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function loadData() {
      try {
        const [usersData, conversationsData] =
          await Promise.all([
            getUsers(),
            getConversations(),
          ]);

        if (!cancelled) {
          setUsers(usersData.users || []);
          setConversations(
            conversationsData.conversations || []
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [username]);

  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!username) return;

    const token = sessionStorage.getItem("chatwave-token");
    if (!token) return;

    function onConnect() {
      setConnected(true);
      setError("");
    }

    function onDisconnect() {
      setConnected(false);
      setOnlineUserIds([]);
    }

    function onConnectError(err) {
      setConnected(false);
      setError(err.message);
    }

    function onHistory(history) {
      setMessages(history);
    }

    function onReceive(message) {
      setMessages((previous) => [...previous, message]);
    }

    function onOnlineUsers(usersList) {
      setOnlineUsers(usersList);
    }

function onPrivateReadUpdate(data) {
  // Refresh unread counts in the sidebar
  refreshConversations();

  // Refresh read receipts for the currently open chat
  if (
    data?.conversationId &&
    String(selectedChatRef.current) ===
      String(data.conversationId)
  ) {
    refreshPrivateReadReceipts(data.conversationId);
  }
}


    
function onPrivateReceive(message) {
  const conversationId = String(message.conversationId);
  const isSelected =
    String(selectedChatRef.current) === conversationId;

  if (isSelected) {
    setPrivateMessages((previous) => {
      const exists = previous.some(
        (item) =>
          String(item.id || item._id) === String(message.id)
      );

      if (exists) return previous;

      return [...previous, message];
    });

    // Mark an incoming message as read if its chat is open
    if (String(message.senderId) !== String(activeUserId)) {
      markConversationRead(conversationId)
        .then(() => {
          socket.emit("private:read", { conversationId });
          return refreshConversations();
        })
        .catch((error) => {
          console.error("Could not mark message read:", error);
        });
    }
  }

  // Update unread counts for all conversations
  refreshConversations();
}


    function onChatError(message) {
      setError(
        typeof message === "string"
          ? message
          : "Chat error occurred"
      );
    }


function onPrivateMessageUpdated(data) {
  setPrivateMessages((previous) =>
    previous.map((message) => {
      const id = String(message.id || message._id);

      if (id !== String(data.messageId)) {
        return message;
      }

      return {
        ...message,
        text: data.text,
        edited: data.edited,
        editedAt: data.editedAt,
        deleted: data.deleted,
        deletedAt: data.deletedAt,
      };
    })
  );

  refreshConversations();
}


function onPrivateTypingUpdate(data) {
  if (!data?.conversationId) return;

  // Only show typing for the currently selected chat
  if (
    String(selectedChatRef.current) !==
    String(data.conversationId)
  ) {
    return;
  }

  // Clear any previous receiver-side timer
  if (incomingTypingTimeoutRef.current) {
    clearTimeout(incomingTypingTimeoutRef.current);
    incomingTypingTimeoutRef.current = null;
  }

  if (data.isTyping === true) {
    const requestId = ++incomingTypingRequestRef.current;

    getUsers()
      .then((usersData) => {
        if (incomingTypingRequestRef.current !== requestId) return;

        const currentTyper = (usersData.users || []).find(
          (user) => String(user.id) === String(data.userId)
        );

        setTypingUser({
          conversationId: data.conversationId,
          userId: data.userId,
          username: currentTyper?.username || data.username,
        });
      })
      .catch(() => {
        if (incomingTypingRequestRef.current !== requestId) return;

        setTypingUser({
          conversationId: data.conversationId,
          userId: data.userId,
          username: data.username,
        });
      });

    // Safety fallback if the stop event is missed
    incomingTypingTimeoutRef.current = setTimeout(() => {
      setTypingUser(null);
      incomingTypingTimeoutRef.current = null;
    }, 4000);
  } else {
    incomingTypingRequestRef.current++;
    setTypingUser(null);
  }
}


    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("chat:history", onHistory);
    socket.on("chat:receive", onReceive);
    socket.on("users:online", onOnlineUsers);
    socket.on("private:receive", onPrivateReceive);
    socket.on("private:read:update", onPrivateReadUpdate);
    socket.on("private:typing:update", onPrivateTypingUpdate);
    socket.on("private:message:updated",onPrivateMessageUpdated);
    socket.on("presence:list", onPresenceList);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("chat:error", onChatError);

    socket.auth = { token };
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:history", onHistory);
      socket.off("chat:receive", onReceive);
      socket.off("users:online", onOnlineUsers);
      socket.off("private:receive", onPrivateReceive);
      socket.off("private:read:update", onPrivateReadUpdate);
      socket.off("private:typing:update", onPrivateTypingUpdate);
             if (incomingTypingTimeoutRef.current) {
                  clearTimeout(incomingTypingTimeoutRef.current);
                  incomingTypingTimeoutRef.current = null;
             }
      socket.off("private:message:updated",onPrivateMessageUpdated);
      socket.off("presence:list", onPresenceList);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("chat:error", onChatError);
      socket.disconnect();
    };
  }, [username]);

  // Scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, privateMessages, selectedChat]);


function onPresenceList(data) {
  const ids = data?.onlineUserIds || [];

  setOnlineUserIds(ids.map(String));
}

function onPresenceUpdate(data) {
  if (!data?.userId) return;

  const id = String(data.userId);

  setOnlineUserIds((previous) => {
    if (data.isOnline) {
      return [...new Set([...previous, id])];
    }

    return previous.filter(
      (userId) => userId !== id
    );
  });
}


function stopTyping() {
  // Cancel the existing inactivity timer
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }

  const conversationId = typingConversationRef.current;

  // Tell the receiver that typing has stopped
  if (
    typingSentRef.current &&
    conversationId &&
    socket.connected
  ) {
    socket.emit("private:typing", {
      conversationId,
      isTyping: false,
    });
  }

  typingSentRef.current = false;
  typingConversationRef.current = null;
}


function handleMessageInputChange(event) {
  const value = event.target.value;

  setMessageInput(value);

  // Typing indicators are only for private chats
  if (
    selectedChat === "general" ||
    !socket.connected ||
    loadingChat
  ) {
    stopTyping();
    return;
  }

  // Empty input means the user stopped typing
  if (!value.trim()) {
    stopTyping();
    return;
  }

  // Emit "typing started" only once
  if (
    !typingSentRef.current ||
    typingConversationRef.current !== selectedChat
  ) {
    if (typingSentRef.current) {
      stopTyping();
    }
    
    console.log("Sending typing event:", {
  conversationId: selectedChat,
  isTyping: true,
});

socket.emit("private:typing", {
  conversationId: selectedChat,
  isTyping: true,
});

    socket.emit("private:typing", {
      conversationId: selectedChat,
      isTyping: true,
    });

    typingSentRef.current = true;
    typingConversationRef.current = selectedChat;
  }

  // Reset the inactivity timer after each keystroke
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    stopTyping();
  }, 1500);
}


  // Switch to General Chat
  function openGeneralChat() {

    stopTyping();
    setTypingUser(null);
    setSelectedChat("general");
    selectedChatRef.current = "general";
    setSelectedConversation(null);
    setMessageInput("");
    setError("");
  }

  // Open a private conversation
  
async function openPrivateChat(user) {
  stopTyping();
setTypingUser(null);

if (incomingTypingTimeoutRef.current) {
  clearTimeout(incomingTypingTimeoutRef.current);
  incomingTypingTimeoutRef.current = null;
}
  try {
    setLoadingChat(true);
    setError("");

    const result = await createConversation(user.id);
    const conversation = result.conversation;
    const conversationId = conversation._id;

    // Select this private conversation
    setSelectedChat(conversationId);
    selectedChatRef.current = conversationId;
    setSelectedConversation(conversation);
    setPrivateMessages([]);
    setMessageInput("");

    // Load previous messages
    const history = await getPrivateMessages(conversationId);

    if (selectedChatRef.current !== conversationId) {
      return;
    }

    const formattedMessages = (history.messages || []).map(
      (message) => ({
        ...message,
        id: message._id,
        conversationId,
        senderId:
          message.sender?._id || message.sender,
        sender:
          message.sender?.username || "Unknown",
      })
    );

    setPrivateMessages(formattedMessages);

    // Mark received messages as read in MongoDB
    await markConversationRead(conversationId);

    if (selectedChatRef.current !== conversationId) {
      return;
    }

    // Notify participants that read status changed
    socket.emit("private:read", { conversationId });

    // Refresh unread badges
    await refreshConversations();

    // Reconcile messages that arrived during loading
    const latestHistory = await getPrivateMessages(
      conversationId
    );

    if (selectedChatRef.current === conversationId) {
      setPrivateMessages((previous) => {
        const merged = new Map();

        for (const message of [
          ...latestHistory.messages.map((item) => ({
            ...item,
            id: item._id,
            conversationId,
            senderId: item.sender?._id || item.sender,
            sender: item.sender?.username || "Unknown",
          })),
          ...previous,
        ]) {
          merged.set(String(message.id || message._id), message);
        }

        return Array.from(merged.values()).sort(
          (a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingChat(false);
  }
}

  
function startEditingMessage(message) {
  setEditingMessageId(message.id || message._id);
  setEditingText(message.text);
  setMessageMenuId(null);
}

async function handleSaveEditedMessage(messageId) {
  const text = editingText.trim();

  if (!text || !selectedChat) return;

  try {
    setMessageActionLoading(true);

    await editPrivateMessage(
      selectedChat,
      messageId,
      text
    );

    setEditingMessageId(null);
    setEditingText("");
  } catch (error) {
    alert(error.message);
  } finally {
    setMessageActionLoading(false);
  }
}

async function handleDeleteMessage(messageId) {
  if (!selectedChat) return;

  const confirmed = window.confirm(
    "Delete this message for everyone?"
  );

  if (!confirmed) return;

  try {
    setMessageActionLoading(true);

    await deletePrivateMessage(
      selectedChat,
      messageId
    );

    setMessageMenuId(null);
  } catch (error) {
    alert(error.message);
  } finally {
    setMessageActionLoading(false);
  }
}


  // Send public or private message
  function sendMessage(event) {
    event.preventDefault();

    const text = messageInput.trim();

    if (!text || !connected || loadingChat) return;

    stopTyping();

    if (selectedChat === "general") {
      socket.emit("chat:send", { text });
      setMessageInput("");
      return;
    }

    const conversationId = selectedChat;

    socket
      .timeout(10000)
      .emit(
        "private:send",
        { conversationId, text },
        (err, response) => {
          if (err) {
            setError("Message timed out. Please try again.");
            return;
          }

          if (!response?.success) {
            setError(
              response?.message || "Could not send message"
            );
            return;
          }
           refreshConversations();
        }
      );

    setMessageInput("");
  }

  const selectedPartner =
    selectedConversation?.participants?.find(
      (participant) =>
        String(participant._id) !== String(activeUserId)
    );

  const visibleMessages =
    selectedChat === "general"
      ? messages
      : privateMessages;

  if (!username) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <main className="chat-page">
      <ChatHeader
        currentUser={currentUser}
        username={username}
        connected={connected}
        onLogout={handleLogout}
      />

      <div className="chat-layout">
        <ChatSidebar
          username={username}
          currentUser={currentUser}
          users={users}
          conversations={conversations}
          sortedUsers={sortedUsers}
          selectedChat={selectedChat}
          activeUserId={activeUserId}
          isUserOnline={isUserOnline}
          onOpenGeneralChat={openGeneralChat}
          onOpenPrivateChat={openPrivateChat}
          onOpenProfile={() => setShowProfile(true)}
        />

        <section className="chat-content">
          <ConversationHeader
            selectedChat={selectedChat}
            selectedPartner={selectedPartner}
            isPartnerOnline={isUserOnline(selectedPartner?._id)}
          />

          {error && (
            <div className="chat-error">
              {error}
              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <MessageList
            selectedChat={selectedChat}
            visibleMessages={visibleMessages}
            loadingChat={loadingChat}
            username={username}
            activeUserId={activeUserId}
            typingUser={typingUser}
            messagesEndRef={messagesEndRef}
            messageMenuId={messageMenuId}
            editingMessageId={editingMessageId}
            editingText={editingText}
            messageActionLoading={messageActionLoading}
            setMessageMenuId={setMessageMenuId}
            setEditingText={setEditingText}
            onStartEditing={startEditingMessage}
            onCancelEditing={() => {
              setEditingMessageId(null);
              setEditingText("");
            }}
            onSaveEdited={handleSaveEditedMessage}
            onDeleteMessage={handleDeleteMessage}
          />

          <MessageComposer
            selectedChat={selectedChat}
            messageInput={messageInput}
            connected={connected}
            loadingChat={loadingChat}
            onMessageInputChange={handleMessageInputChange}
            onSendMessage={sendMessage}
          />
        </section>

      </div>

      {showProfile && (
        <ProfilePanel
          onClose={() => setShowProfile(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </main>

    
  );
}

export default App;
