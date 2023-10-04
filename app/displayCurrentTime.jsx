"use client";
export default function DisplayCurrentTime() {
  const curr_time = new Date().toLocaleString("en-us", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return <span className="text-sm">{curr_time}</span>;
}
