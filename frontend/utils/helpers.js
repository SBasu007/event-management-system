export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatTitle(text) {
  if (!text) {
    return "";
  }

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
