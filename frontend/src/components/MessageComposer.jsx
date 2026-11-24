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
      className="flex min-h-[64px] items-center border-t border-[#2a3942] bg-[#202c33] px-3 py-2 md:px-4"
      onSubmit={onSendMessage}
    >
      <div className="flex w-full items-center gap-2 rounded-lg border border-[#2a3942] bg-[#2a3942] p-1 transition focus-within:border-[#3b4a54] focus-within:bg-[#2a3942]">
        <input
          type="text"
          className="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]"
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#00a884] text-[#111b21] transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-40"
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
