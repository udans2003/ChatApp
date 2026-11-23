export default function ChatHeader({
  currentUser,
  username,
  connected,
  onLogout,
}) {
  const displayName = currentUser?.username || username;

  return (
    <header className="chat-header">
      <div className="brand-icon">C</div>

      <div className="header-title">
        <h1>ChatWave</h1>
        <p>Real-time messaging</p>
      </div>

      <div className="logged-in-user">
        <div className="logged-in-avatar">
          {(displayName || "U").charAt(0).toUpperCase()}
        </div>
        <div className="logged-in-details">
          <span className="logged-in-label">Logged in as</span>
          <span className="logged-in-name">{displayName}</span>
        </div>
      </div>

      <div className="connection-status">
        <span
          className={connected ? "status-dot" : "status-dot offline"}
        />
        {connected ? "Connected" : "Reconnecting..."}
      </div>

      <button
        className="leave-button"
        onClick={onLogout}
      >
        Log Out
      </button>
    </header>
  );
}
