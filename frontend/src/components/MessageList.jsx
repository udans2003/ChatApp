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
    <div
      className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto px-3 py-4 md:px-7 md:py-6"
      style={{
        backgroundImage:
          'linear-gradient(rgba(11,20,27,.78), rgba(11,20,27,.78)), url("./src/assets/bg.jpg")',
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
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
              className={`mb-1 flex items-start ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[82%] rounded-lg px-3 py-2 shadow-sm md:max-w-[72%] ${
                  isOwnMessage
                    ? "rounded-tr-sm border border-[#055c4e] bg-[#005c4b] text-[#e9edef]"
                    : "rounded-tl-sm border border-[#2a3942] bg-[#202c33] text-[#e9edef]"
                }`}
              >
                {selectedChat === "general" && (
                  <span className="mb-1 block text-xs font-bold text-[#00a884]">
                    {isOwnMessage ? "You" : senderName}
                  </span>
                )}

                {selectedChat !== "general" &&
                  isOwnMessage &&
                  !message.deleted && (
                    <div className="absolute right-2 top-1 z-10">
                      <button
                        type="button"
                        className="px-1.5 text-lg leading-none text-slate-500"
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
                        <div className="absolute right-0 top-7 min-w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50"
                            onClick={() => onStartEditing(message)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50"
                            onClick={() => onDeleteMessage(messageId)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {message.deleted ? (
                  <p className="m-0 pr-1 text-sm font-semibold italic text-[#8696a0]">
                    This message was deleted
                  </p>
                ) : editingMessageId === messageId ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      value={editingText}
                      onChange={(event) =>
                        setEditingText(event.target.value)
                      }
                      maxLength={5000}
                      rows={2}
                      className="w-full resize-y rounded-lg border border-slate-300 p-2 text-sm text-slate-800 outline-none focus:border-teal-600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveEdited(messageId)}
                        className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={messageActionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="m-0 whitespace-pre-wrap break-words leading-relaxed">
                    {message.text}
                    {message.edited && (
                      <span className="edited-label"> (edited)</span>
                    )}
                  </p>
                )}

                <div className="mt-1 flex min-h-4 items-center justify-end gap-1.5">
                  <span className="text-[10px] text-[#8696a0]">
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
                      className="flex items-center gap-1 text-[10px] text-[#53bdeb]"
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
          <div className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-700"></span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-700"></span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-700"></span>
            </div>
            <span className="text-xs italic text-slate-500">
              {typingUser.username} is typing...
            </span>
          </div>
        )}

      <div ref={messagesEndRef} />
    </div>
  );
}
