export default function MessageList({
  selectedChat,
  visibleMessages,
  loadingChat,
  username,
  activeUserId,
  typingUser,
  messagesEndRef,
  messageMenuId,
  editingMessageId,
  editingText,
  messageActionLoading,
  setMessageMenuId,
  setEditingText,
  onStartEditing,
  onCancelEditing,
  onSaveEdited,
  onDeleteMessage,
}) {
  return (
    <div className="message-list">
      {loadingChat ? (
        <p className="empty-chat">Loading conversation...</p>
      ) : visibleMessages.length === 0 ? (
        <p className="empty-chat">
          No messages yet. Start a conversation!
        </p>
      ) : (
        visibleMessages.map((message) => {
          const isOwnMessage =
            selectedChat === "general"
              ? message.sender === username
              : String(message.senderId) === String(activeUserId);
          const messageId = message.id || message._id;
          const senderName =
            typeof message.sender === "object"
              ? message.sender.username
              : message.sender;

          return (
            <div
              key={messageId}
              className={`message-row ${
                isOwnMessage ? "own" : ""
              }`}
            >
              <div className="message-bubble">
                {selectedChat === "general" && (
                  <span className="message-sender">
                    {isOwnMessage ? "You" : senderName}
                  </span>
                )}

                {selectedChat !== "general" &&
                  isOwnMessage &&
                  !message.deleted && (
                    <div className="message-actions">
                      <button
                        type="button"
                        className="message-menu-button"
                        onClick={() =>
                          setMessageMenuId(
                            messageMenuId === messageId
                              ? null
                              : messageId
                          )
                        }
                      >
                        ⋯
                      </button>

                      {messageMenuId === messageId && (
                        <div className="message-actions-dropdown">
                          <button
                            type="button"
                            onClick={() => onStartEditing(message)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(messageId)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {message.deleted ? (
                  <p className="deleted-message">
                    This message was deleted
                  </p>
                ) : editingMessageId === messageId ? (
                  <div className="message-edit-form">
                    <textarea
                      value={editingText}
                      onChange={(event) =>
                        setEditingText(event.target.value)
                      }
                      maxLength={5000}
                      rows={2}
                    />
                    <div className="message-edit-buttons">
                      <button
                        type="button"
                        onClick={() => onSaveEdited(messageId)}
                        disabled={
                          messageActionLoading ||
                          !editingText.trim()
                        }
                      >
                        {messageActionLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEditing}
                        disabled={messageActionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>
                    {message.text}
                    {message.edited && (
                      <span className="edited-label"> (edited)</span>
                    )}
                  </p>
                )}

                <div className="message-footer">
                  <span className="message-time">
                    {message.time ||
                      (message.createdAt
                        ? new Date(
                            message.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "")}
                  </span>

                  {selectedChat !== "general" && isOwnMessage && (
                    <span
                      className={`message-receipt ${
                        message.read === true ? "is-read" : "is-sent"
                      }`}
                      title={
                        message.read === true
                          ? "Read by recipient"
                          : "Saved to server"
                      }
                    >
                      <span className="receipt-icon">
                        {message.read === true ? "✓✓" : "✓"}
                      </span>
                      <span>
                        {message.read === true ? "Read" : "Sent"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {selectedChat !== "general" &&
        typingUser &&
        String(typingUser.conversationId) ===
          String(selectedChat) && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {typingUser.username} is typing...
            </span>
          </div>
        )}

      <div ref={messagesEndRef} />
    </div>
  );
}
