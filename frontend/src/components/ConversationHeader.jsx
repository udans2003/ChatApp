export default function ConversationHeader({
  selectedChat,
  selectedPartner,
  isPartnerOnline,
}) {
  return (
    <div className="conversation-heading">
      <div className="conversation-heading-info">
        <div className="conversation-title-row">
          <h2
            className={`conversation-title ${
              selectedChat === "general"
                ? "general-chat-title"
                : "receiver-name"
            }`}
          >
            {selectedChat === "general"
              ? "General Chat"
              : selectedPartner?.username || "Private Chat"}
          </h2>
        </div>

        <div className="chat-header-user">
          {selectedChat !== "general" && selectedPartner && (
            <div
              className={`chat-presence-status ${
                isPartnerOnline ? "online" : "offline"
              }`}
            >
              <span
                className={`header-presence-dot ${
                  isPartnerOnline ? "online" : "offline"
                }`}
              />
              <span>{isPartnerOnline ? "Online" : "Offline"}</span>
            </div>
          )}
        </div>
      </div>

      <span className="chat-label">
        {selectedChat === "general" ? "Public Room" : "Private Chat"}
      </span>
    </div>
  );
}
