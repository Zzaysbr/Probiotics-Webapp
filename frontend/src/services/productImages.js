export function productImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const origin = new URL(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    window.location.origin,
  ).origin;
  if (/^uploads\/products\/[a-zA-Z0-9._-]+\.(png|jpe?g)$/.test(path))
    path = "/image/pdimages/" + path.split("/").pop();
  return /^\/image\/pdimages\/[a-zA-Z0-9._-]+\.(png|jpe?g)$/.test(path)
    ? origin + path
    : "";
}
