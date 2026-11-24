export function formatChatTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const messageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const daysDifference = Math.round(
    (
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(
        messageDay.getFullYear(),
        messageDay.getMonth(),
        messageDay.getDate()
      )
    ) /
      86400000
  );

  if (daysDifference === 0) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (daysDifference === 1) {
    return "Yesterday";
  }

  if (daysDifference > 1 && daysDifference < 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}
