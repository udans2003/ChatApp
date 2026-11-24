export default function ConversationHeader({
  selectedChat,
  selectedPartner,
  isPartnerOnline,
}) {
  const isGeneralChat = selectedChat === "general";
  const displayName = isGeneralChat
    ? "General Chat"
    : selectedPartner?.username || "Private Chat";

  return (
    <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-[#2a3942] bg-[#202c33] px-4 py-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3b4a54] text-sm font-bold text-[#e9edef]">
          {isGeneralChat ? (
            "#"
          ) : selectedPartner?.profilePicture ? (
            <img
              src={selectedPartner.profilePicture}
              alt={`${displayName}'s profile`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
          {!isGeneralChat && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#202c33] ${
                isPartnerOnline ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          )}
        </span>

        <div className="min-w-0">
          <h2
            className="m-0 truncate text-sm font-semibold text-[#e9edef] md:text-base"
          >
            {displayName}
          </h2>

          {!isGeneralChat && selectedPartner && (
            <div className="mt-1 text-[11px] text-[#8696a0]">
              {isPartnerOnline ? "Online" : "Offline"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
