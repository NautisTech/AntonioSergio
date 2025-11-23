export const stripHtml = (html?: string) => {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
  // Fallback for SSR: simple regex (keeps it safe for server-side)
  return html.replace(/<[^>]*>/g, "");
};

export const plainTextTruncate = (html?: string, max = 35) => {
  const text = stripHtml(html);
  if (text.length > max) return text.substring(0, max) + "...";
  return text;
};
