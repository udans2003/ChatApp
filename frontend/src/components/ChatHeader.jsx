export default function ChatHeader({
  currentUser,
  username,
  connected,
  onLogout,
}) {
  const displayName = currentUser?.username || username;

  return (
    <header className="flex h-[64px] min-h-[64px] items-center gap-3 border-b border-[#26354a] bg-[#202c33] px-4 text-[#e9edef] md:px-5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00a884] text-lg font-black text-white">
        <span aria-hidden="true">C</span>
      </div>

      <div className="mr-auto min-w-0">
        <h1 className="m-0 text-base font-bold tracking-wide text-[#e9edef]">ChatWave</h1>
        <p className="hidden text-[11px] text-[#8696a0] sm:block">Real-time messaging</p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {currentUser?.profilePicture ? (
          <img
            src={currentUser.profilePicture}
            alt={`${displayName}'s profile`}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#374248] text-xs font-bold text-[#d1d7db]">
            {(displayName || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] text-[#8696a0]">Logged in as</span>
          <span className="text-xs font-semibold text-[#d1d7db]">{displayName}</span>
        </div>
      </div>

      <div className="hidden items-center gap-2 text-xs text-[#8696a0] lg:flex">
        <span
          className={`h-2 w-2 rounded-full ${connected ? "bg-[#00a884]" : "bg-amber-400"}`}
        />
        {connected ? "Connected" : "Reconnecting..."}
      </div>

      <button
        className="shrink-0 rounded-full border border-[#374248] bg-[#2a3942] px-3 py-1.5 text-xs font-semibold text-[#d1d7db] transition hover:bg-[#374248]"
        onClick={onLogout}
      >
        Log Out
      </button>
    </header>
  );
}
