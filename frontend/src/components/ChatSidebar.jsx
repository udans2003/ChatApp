import { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const showGeneralChat =
    !normalizedQuery ||
    ["general chat", "group chat", "public room"].some((label) =>
      label.includes(normalizedQuery)
    );
  const filteredUsers = sortedUsers.filter((user) => {
    if (!normalizedQuery) return true;

    const conversation = conversations.find((item) =>
      item.participants.some(
        (participant) =>
          String(participant._id) === String(user.id)
      )
    );
    const previewText = conversation?.lastMessage?.text || "";

    return (
      user.username.toLowerCase().includes(normalizedQuery) ||
      previewText.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <aside className="flex min-h-0 flex-col border-r border-[#2a3942] bg-[#111b21]">
      <div className="flex h-[64px] shrink-0 items-center justify-between px-4">
        <h3 className="text-[20px] font-semibold tracking-tight text-[#e9edef]">
          Chats
        </h3>
        {/* <div className="flex items-center gap-2">
          <button type="button" aria-label="New chat" className="grid h-8 w-8 place-items-center rounded-full bg-[#00a884] text-lg font-bold text-[#111b21]">+</button>
          <button type="button" aria-label="Chat menu" className="grid h-8 w-8 place-items-center rounded-full text-xl text-[#aebac1]">⋮</button>
        </div> */}
      </div>

      <div className="px-3 pb-2">
        <label className="flex h-10 items-center rounded-lg bg-[#202c33] px-3 text-sm text-[#8696a0]">
          <span className="mr-3 text-base">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chat"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]"
            aria-label="Search chats"
          />
        </label>
      </div>

      {showGeneralChat && (
        <button
          className={`mx-0 flex w-full items-center gap-3 px-3 py-2 text-left transition duration-200 ${
            selectedChat === "general"
              ? "bg-[#202c33] text-[#e9edef]"
              : "text-[#d1d7db] hover:bg-[#202c33]"
          }`}
          onClick={onOpenGeneralChat}
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#00a884] text-xl font-black text-white">#</span>
          <span className="hidden truncate text-sm font-semibold md:block">General Chat</span>
        </button>
      )}

      <h4 className="mx-4 mb-1 mt-2 hidden text-[10px] font-bold uppercase tracking-widest text-[#8696a0] md:block">
        Private Chats
      </h4>

      {users.length === 0 && (
        <p className="hidden px-3 py-4 text-center text-xs text-slate-400 md:block">
          No other registered users found.
        </p>
      )}

      {normalizedQuery && filteredUsers.length === 0 && users.length > 0 && (
        <p className="hidden px-3 py-4 text-center text-xs text-slate-400 md:block">
          No chats match "{searchQuery.trim()}".
        </p>
      )}

      {filteredUsers.map((user) => {
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
            className={`group flex min-h-[68px] w-full items-center gap-3 px-3 py-2 text-left transition duration-200 ${
              selectedChat === conversation?._id
                ? "bg-[#202c33]"
                : "hover:bg-[#202c33]"
            }`}
            onClick={() => onOpenPrivateChat(user)}
          >
            <span className="relative shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  className="h-12 w-12 rounded-full object-cover transition group-hover:scale-[1.03]"
                />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#3b4a54] text-base font-bold text-[#d1d7db] transition group-hover:scale-[1.03]">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  userIsOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
                title={userIsOnline ? "Online" : "Offline"}
              />
            </span>

            <span className="hidden min-w-0 flex-1 flex-col md:flex">
              <span className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-[#e9edef]">
                  {user.username}
                </span>
                {conversation?.lastMessageAt && (
                  <span className="shrink-0 text-[10px] text-[#8696a0]">
                    {formatChatTime(conversation.lastMessageAt)}
                  </span>
                )}
              </span>

              <span className="mt-1 flex min-w-0 items-center justify-between gap-2">
                <span
                  className={`min-w-0 truncate text-xs ${
                    conversation?.unreadCount > 0
                      ? "font-semibold text-[#d1d7db]"
                      : "text-[#8696a0]"
                  }`}
                >
                  {previewText}
                </span>
                {conversation?.unreadCount > 0 && (
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">
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

      <div className="mt-auto shrink-0 border-t border-[#2a3942] bg-[#111b21] p-2 md:p-3">
        <button
          type="button"
          className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-lg border border-[#2a3942] bg-[#202c33] px-2 text-left transition hover:bg-[#2a3942] md:px-3"
          onClick={onOpenProfile}
        >
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt={`${currentUser.username || username}'s profile`}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#00a884] text-sm font-black text-white">
              {(currentUser?.username || username || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
          <span className="hidden min-w-0 flex-1 flex-col md:flex">
            <strong className="truncate text-xs text-[#e9edef]">{currentUser?.username || username}</strong>
            <small className="text-[10px] text-[#8696a0]">View / Edit Profile</small>
          </span>
          <span className="hidden text-slate-400 md:block">⚙</span>
        </button>
      </div>
    </aside>
  );
}
