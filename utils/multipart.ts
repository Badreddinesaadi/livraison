import { File } from "expo-file-system";

export type MultipartPartDebug =
  | { name: string; kind: "text"; size: number }
  | {
      name: string;
      kind: "file";
      fileName: string;
      mimeType: string;
      size: number;
    };

export type MultipartBody = {
  body: Uint8Array;
  contentType: string;
  parts: MultipartPartDebug[];
};

type FormDataTextPart = {
  fieldName: string;
  string: string;
};

type FormDataFilePart = {
  fieldName: string;
  uri: string;
  name?: string;
  type?: string;
};

const CRLF = "\r\n";

const randomBoundary = () => {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return `----sdkwood${Array.from(bytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("")}`;
};

const sanitizeFileName = (name: string) =>
  name.replace(/["\r\n]/g, "_") || "file";

const utf8Bytes = (text: string): Uint8Array => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text);
  }
  const bin = unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
};

/**
 * Serializes a React Native FormData into a raw multipart body.
 *
 * Global fetch cannot reliably serialize `{uri, name, type}` file parts on
 * this stack, so the body is assembled manually in JS (headers as UTF-8,
 * files read via expo-file-system) and sent as a `Uint8Array` — a shape
 * React Native's networking layer converts to base64 natively.
 */
export const buildMultipartBody = async (
  formData: FormData,
): Promise<MultipartBody> => {
  const boundary = randomBoundary();
  const chunks: Uint8Array[] = [];
  const parts: MultipartPartDebug[] = [];
  let totalLength = 0;

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    totalLength += bytes.length;
  };
  const pushText = (text: string) => pushBytes(utf8Bytes(text));

  const rawParts = (
    formData as unknown as {
      getParts(): unknown[];
    }
  ).getParts() as unknown as (FormDataTextPart | FormDataFilePart)[];

  for (const part of rawParts) {
    const fieldName = part.fieldName ?? "field";
    if ("uri" in part && typeof part.uri === "string") {
      const file = new File(part.uri);
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const fileName = sanitizeFileName(
        part.name || file.name || "file",
      );
      const mimeType = part.type || "application/octet-stream";
      pushText(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`,
      );
      pushBytes(fileBytes);
      pushText(CRLF);
      parts.push({
        name: fieldName,
        kind: "file",
        fileName,
        mimeType,
        size: fileBytes.length,
      });
    } else if ("string" in part) {
      const value = String(part.string ?? "");
      pushText(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${fieldName}"${CRLF}${CRLF}${value}${CRLF}`,
      );
      parts.push({ name: fieldName, kind: "text", size: value.length });
    }
  }

  pushText(`--${boundary}--${CRLF}`);

  const body = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
    parts,
  };
};