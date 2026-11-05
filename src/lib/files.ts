// src/lib/files.ts — safe handling of attachment URLs (no Node-only APIs; usable anywhere)

export type FileKind = "pdf" | "image";

export const MAX_FILE_URL_LENGTH = 22_000_000; // ≈ 16 MB PDF after base64 (+33 %)

const DATA_URL_RE = /^data:(application\/pdf|image\/png|image\/jpeg|image\/webp);base64,/;

/** Identify a file from its first bytes — never trust the client-declared type. */
export function sniffMime(b: Uint8Array): string | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x);
  if (at(0, 0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf";               // %PDF-
  if (at(0, 0x89, 0x50, 0x4e, 0x47))       return "image/png";
  if (at(0, 0xff, 0xd8, 0xff))             return "image/jpeg";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

/** Only allow (a) validated base64 data URLs or (b) https URLs on our storage hosts. */
export function isAllowedFileUrl(url: string): boolean {
  if (url.length > MAX_FILE_URL_LENGTH) return false;

  const m = DATA_URL_RE.exec(url);
  if (m) {
    try {
      const head = atob(url.slice(m[0].length, m[0].length + 24));
      const bytes = Uint8Array.from(head, (c) => c.charCodeAt(0));
      return sniffMime(bytes) === m[1];
    } catch { return false; }
  }

  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      (u.hostname === "utfs.io" || u.hostname === "uploadthing.com" || u.hostname.endsWith(".ufs.sh"));
  } catch { return false; }
}

export function isDataUrl(url: string): boolean { return url.startsWith("data:"); }

export function kindFromMime(mime: string): FileKind { return mime === "application/pdf" ? "pdf" : "image"; }

export function kindFromUrl(url: string): FileKind | null {
  if (isDataUrl(url)) {
    const m = DATA_URL_RE.exec(url);
    return m ? kindFromMime(m[1]) : null;
  }
  const path = url.toLowerCase().split("?")[0];
  if (path.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|webp)$/.test(path)) return "image";
  return null;
}
