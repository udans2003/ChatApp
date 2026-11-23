export default function MessageComposer({
  selectedChat,
  messageInput,
  connected,
  loadingChat,
  onMessageInputChange,
  onSendMessage,
}) {
  return (
    <form
      className="message-form"
      onSubmit={onSendMessage}
    >
      <div className="message-composer">
        <input
          type="text"
          placeholder={
            selectedChat === "general"
              ? "Message everyone..."
              : "Type a private message..."
          }
          value={messageInput}
          maxLength={2000}
          onChange={onMessageInputChange}
          disabled={!connected || loadingChat}
        />
        <button
          type="submit"
          className="send-message-button"
          aria-label="Send message"
          title="Send message"
          disabled={
            !connected ||
            !messageInput.trim() ||
            loadingChat
          }
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 20V4l18 8-18 8Zm2-3.2 10.8-4.8L5 7.2v3.3l6.2 1.5L5 13.5v3.3Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
