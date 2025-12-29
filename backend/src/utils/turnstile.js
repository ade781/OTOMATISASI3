export async function verifyTurnstileToken({ token, ip }) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) throw new Error("TURNSTILE_SECRET is not set");

  if (!token || typeof token !== "string") {
    return { ok: false, reason: "missing_token" };
  }

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );

  // Jika Cloudflare down / network error, fetch akan throw — ditangani di caller
  const data = await resp.json();
  return { ok: data.success === true, data };
}
