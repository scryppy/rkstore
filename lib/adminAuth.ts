// Auth de admin por senha única (sem dependências novas).
// Token = HMAC-SHA256(ADMIN_SECRET, "rk-admin-v1") em base64url.
// Usável tanto no middleware (Edge) quanto em server actions (Node):
// crypto.subtle é global nos dois runtimes do Next.

export const ADMIN_COOKIE = "rk_admin";
const PAYLOAD = "rk-admin-v1";

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  const b64 = btoa(str);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function makeToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(PAYLOAD));
  return toBase64Url(sig);
}

export async function expectedToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  return makeToken(secret);
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedToken();
  if (!expected) return false;
  // comparação simples; tokens têm tamanho fixo
  return token === expected;
}

export function checkPassword(password: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  return !!real && password === real;
}
