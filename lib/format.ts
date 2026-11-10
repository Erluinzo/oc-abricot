import type { Task, User } from "./api";

//"Alice Martin" -> "AM", no name -> the first 2 letters of the email
export function getInitials(user: User) {
  const text = user.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
    : user.email;
  return text.slice(0, 2).toUpperCase();
}

//the text and colors of each status tag (cancelled exists in the backend, not in figma)
export const STATUS: Record<Task["status"], string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

//"2024-03-09T00:00:00.000Z" -> "9 mars". The backend saves the day at midnight UTC
export function formatDay(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

//"23 mars, 11:20". The time zone is fixed so the server and the browser write the same text
export function formatDateTime(date: string) {
  const options = { timeZone: "Europe/Paris" } as const;
  const day = new Date(date).toLocaleDateString("fr-FR", {
    ...options,
    day: "numeric",
    month: "long",
  });
  const time = new Date(date).toLocaleTimeString("fr-FR", {
    ...options,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}, ${time}`;
}
