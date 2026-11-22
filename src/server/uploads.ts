import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  CUSTOM_ORDER_ALLOWED_TYPES,
  CUSTOM_ORDER_MAX_FILE_BYTES,
  CUSTOM_ORDER_MAX_FILES,
} from "@/lib/validation";
import { randomToken } from "./security";

/*
 * Reference-image uploads for custom orders.
 *  - Type is determined from file *content* (magic bytes), not the client MIME or name.
 *  - Only JPEG, PNG and WebP are accepted; SVG/HTML/executables are rejected.
 *  - Files are stored outside /public with server-generated names and 0600 perms,
 *    so they are never served or executed by the web server.
 */

type Allowed = (typeof CUSTOM_ORDER_ALLOWED_TYPES)[number];

export function uploadDir(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "storage", "uploads", "custom-orders");
}

export function sniffImageType(buf: Buffer): Allowed | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}

const EXT: Record<Allowed, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export type UploadCheck =
  | { ok: true; files: { buffer: Buffer; type: Allowed }[] }
  | { ok: false; message: string };

export async function validateUploads(files: File[]): Promise<UploadCheck> {
  if (files.length > CUSTOM_ORDER_MAX_FILES) {
    return { ok: false, message: `You can upload up to ${CUSTOM_ORDER_MAX_FILES} reference images.` };
  }
  const out: { buffer: Buffer; type: Allowed }[] = [];
  for (const f of files) {
    if (f.size === 0) continue;
    if (f.size > CUSTOM_ORDER_MAX_FILE_BYTES) {
      return { ok: false, message: "Each image must be 8 MB or smaller." };
    }
    const buffer = Buffer.from(await f.arrayBuffer());
    const type = sniffImageType(buffer);
    if (!type) {
      return { ok: false, message: "Reference images must be JPEG, PNG or WebP files." };
    }
    out.push({ buffer, type });
  }
  return { ok: true, files: out };
}

/** Writes validated files and returns their server-generated names. */
export function storeUploads(files: { buffer: Buffer; type: Allowed }[]): { storedName: string; type: Allowed; size: number }[] {
  const dir = uploadDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return files.map((f) => {
    const storedName = `${randomToken(18)}.${EXT[f.type]}`;
    fs.writeFileSync(path.join(dir, storedName), f.buffer, { mode: 0o600, flag: "wx" });
    return { storedName, type: f.type, size: f.buffer.length };
  });
}

export function removeStored(names: string[]) {
  for (const n of names) {
    try {
      fs.unlinkSync(path.join(uploadDir(), path.basename(n)));
    } catch {
      /* ignore */
    }
  }
}
