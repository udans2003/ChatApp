import { formatChatTime } from "../utils/chatUtils";

export default function ChatSidebar({
  username,
  currentUser,
  users,
  conversations,
  sortedUsers,
  selectedChat,
  activeUserId,
  isUserOnline,
  onOpenGeneralChat,
  onOpenPrivateChat,
  onOpenProfile,
}) {
  return (
    <aside className="chat-sidebar">
      <h3>Chats</h3>

      <button
        className={`chat-item ${
          selectedChat === "general" ? "active" : ""
        }`}
        onClick={onOpenGeneralChat}
      >
        <span className="chat-avatar">#</span>
        <span>General Chat</span>
      </button>

      <h4>Private Chats</h4>

      {users.length === 0 && (
        <p className="sidebar-empty">
          No other registered users found.
        </p>
      )}

      {sortedUsers.map((user) => {
        const conversation = conversations.find((item) =>
          item.participants.some(
            (participant) =>
              String(participant._id) === String(user.id)
          )
        );
        const userIsOnline = isUserOnline(user.id);
        const lastMessage = conversation?.lastMessage;
        const isOwnLastMessage =
          String(lastMessage?.senderId) ===
          String(activeUserId);
        const previewText = lastMessage
          ? `${isOwnLastMessage ? "You: " : ""}${lastMessage.text}`
          : "No messages yet";

        return (
          <button
            key={user.id}
            className={`chat-item conversation-item ${
              selectedChat === conversation?._id ? "active" : ""
            }`}
            onClick={() => onOpenPrivateChat(user)}
          >
            <span className="avatar-wrapper">
              <span className="chat-avatar">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <span
                className={`presence-dot ${
                  userIsOnline ? "online" : "offline"
                }`}
                title={userIsOnline ? "Online" : "Offline"}
              />
            </span>

            <span className="conversation-info">
              <span className="conversation-top">
                <span className="conversation-name">
                  {user.username}
                </span>
                {conversation?.lastMessageAt && (
                  <span className="conversation-time">
                    {formatChatTime(conversation.lastMessageAt)}
                  </span>
                )}
              </span>

              <span className="conversation-bottom">
                <span
                  className={`conversation-preview ${
                    conversation?.unreadCount > 0 ? "has-unread" : ""
                  }`}
                >
                  {previewText}
                </span>
                {conversation?.unreadCount > 0 && (
                  <span className="unread-badge">
                    {conversation.unreadCount > 99
                      ? "99+"
                      : conversation.unreadCount}
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}

      <div className="sidebar-profile-footer">
        <button
          type="button"
          className="sidebar-profile-button"
          onClick={onOpenProfile}
        >
          <span className="sidebar-profile-avatar">
            {(currentUser?.username || username || "U")
              .charAt(0)
              .toUpperCase()}
          </span>
          <span className="sidebar-profile-details">
            <strong>{currentUser?.username || username}</strong>
            <small>View / Edit Profile</small>
          </span>
          <span className="sidebar-profile-settings">⚙</span>
        </button>
      </div>
    </aside>
  );
}
