const publicPaths = new Set([
  "/", "/work", "/timeline", "/capabilities", "/about", "/contact", "/resume",
]);

export function isTrackablePublicPath(path: string) {
  if (publicPaths.has(path)) return true;
  return path.startsWith("/work/") || path === "/resume/print";
}
