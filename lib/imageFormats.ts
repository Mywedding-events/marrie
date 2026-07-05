export const supportedImageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "svg",
  "JPG",
  "JPEG",
  "PNG",
  "WEBP",
  "AVIF",
  "GIF",
  "SVG",
] as const;

export function getImageMimeType(src: string) {
  const extension = src.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

export function shouldUseUnoptimizedImage(src: string) {
  return /\.(gif|svg)$/i.test(src.split(/[?#]/)[0] ?? src);
}
