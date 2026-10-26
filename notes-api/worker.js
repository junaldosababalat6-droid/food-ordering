const encoder = new TextEncoder();
const PASSWORD_ITERATIONS = 210000;
const TOKEN_LIFETIME_SECONDS = 3600;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64Url(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function equalHash(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function validId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

async function readBody(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Request body must be a JSON object." };
    }
    return { body };
  } catch {
    return { error: "Request body must contain valid JSON." };
  }
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: decodeBase64Url(saltHex),
      iterations: PASSWORD_ITERATIONS,
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(derived));
}

async function createToken(payload, secret) {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const body = encodeBase64Url(JSON.stringify({
    ...payload,
    iat: issuedAt,
    exp: issuedAt + TOKEN_LIFETIME_SECONDS,
  }));
  const message = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return `${message}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function readToken(request, secret) {
  const authorization = request.headers.get("Authorization") || "";
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match) {
    return null;
  }

  const parts = match[1].split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    if (header.alg !== "HS256" || typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );
    return valid ? payload : null;
  } catch {
    return null;
  }
}

async function authenticateAdmin(request, env) {
  const payload = await readToken(request, env.JWT_SECRET);
  if (!payload || payload.role !== "admin" || !Number.isSafeInteger(payload.id)) {
    return null;
  }
  const admin = await env.DB.prepare(
    "SELECT id, username FROM admin_users WHERE id = ?"
  ).bind(payload.id).first();
  return admin && admin.username === payload.username ? admin : null;
}

async function authenticateUser(request, env) {
  const payload = await readToken(request, env.JWT_SECRET);
  if (!payload || payload.role !== "user" || !Number.isSafeInteger(payload.id)) {
    return null;
  }
  const user = await env.DB.prepare(
    "SELECT id, username FROM users WHERE id = ?"
  ).bind(payload.id).first();
  return user && user.username === payload.username ? user : null;
}

async function handleAdminRegister(request, env) {
  const parsed = await readBody(request);
  if (parsed.error) {
    return json({ error: parsed.error }, 400);
  }
  const { username, password } = parsed.body;
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return json({ error: "Username and password are required." }, 400);
  }
  if (password.length < 8) {
    return json({ error: "Admin password must be at least 8 characters." }, 400);
  }

  const normalizedUsername = username.trim();
  const adminExists = await env.DB.prepare("SELECT id FROM admin_users LIMIT 1").first();
  let authorizedAdmin = null;
  if (adminExists) {
    authorizedAdmin = await authenticateAdmin(request, env);
    if (!authorizedAdmin) {
      return json({ error: "Admin login is required to register another admin." }, 401);
    }
  }

  const salt = encodeBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(password, salt);
  try {
    const result = adminExists
      ? await env.DB.prepare(
        "INSERT INTO admin_users (username, password_salt, password_hash) VALUES (?, ?, ?)"
      ).bind(normalizedUsername, salt, passwordHash).run()
      : await env.DB.prepare(
        "INSERT INTO admin_users (username, password_salt, password_hash) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM admin_users)"
      ).bind(normalizedUsername, salt, passwordHash).run();

    if (!result.meta.changes) {
      return json({ error: "An admin was registered already. Log in to add another admin." }, 409);
    }
    return json({ id: Number(result.meta.last_row_id), username: normalizedUsername }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return json({ error: "Admin username already exists." }, 409);
    }
    throw error;
  }
}

async function handleUserRegister(request, env) {
  const parsed = await readBody(request);
  if (parsed.error) {
    return json({ error: parsed.error }, 400);
  }
  const { username, password } = parsed.body;
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return json({ error: "Username and password are required." }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Password must be at least 6 characters." }, 400);
  }

  const normalizedUsername = username.trim();
  const salt = encodeBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(password, salt);
  try {
    const result = await env.DB.prepare(
      "INSERT INTO users (username, password_salt, password_hash) VALUES (?, ?, ?)"
    ).bind(normalizedUsername, salt, passwordHash).run();
    return json({ id: Number(result.meta.last_row_id), username: normalizedUsername }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return json({ error: "Username already taken." }, 409);
    }
    throw error;
  }
}

async function handleLogin(request, env, isAdmin) {
  const parsed = await readBody(request);
  if (parsed.error) {
    return json({ error: parsed.error }, 400);
  }
  const { username, password } = parsed.body;
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return json({ error: "Username and password are required." }, 400);
  }

  const table = isAdmin ? "admin_users" : "users";
  const account = await env.DB.prepare(
    `SELECT id, username, password_salt, password_hash FROM ${table} WHERE username = ?`
  ).bind(username.trim()).first();
  if (!account) {
    return json({ error: "Invalid username or password." }, 401);
  }

  const suppliedHash = await hashPassword(password, account.password_salt);
  if (!equalHash(suppliedHash, account.password_hash)) {
    return json({ error: "Invalid username or password." }, 401);
  }

  const token = await createToken(
    {
      id: account.id,
      username: account.username,
      role: isAdmin ? "admin" : "user",
    },
    env.JWT_SECRET
  );
  return json({ token, username: account.username });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method;

  if (method === "GET" && path === "/health") {
    return json({ status: "ok" });
  }
  if (method === "GET" && path === "/api/admin/bootstrap-status") {
    const admin = await env.DB.prepare("SELECT id FROM admin_users LIMIT 1").first();
    return json({ adminExists: Boolean(admin) });
  }
  if (method === "POST" && path === "/api/admin/register") {
    return handleAdminRegister(request, env);
  }
  if (method === "POST" && path === "/api/admin/login") {
    return handleLogin(request, env, true);
  }
  if (method === "GET" && path === "/api/admin/me") {
    const admin = await authenticateAdmin(request, env);
    if (!admin) {
      return json({ error: "Invalid or expired admin session." }, 401);
    }
    return json({ id: admin.id, username: admin.username });
  }
  if (method === "POST" && path === "/api/auth/register") {
    return handleUserRegister(request, env);
  }
  if (method === "POST" && path === "/api/auth/login") {
    return handleLogin(request, env, false);
  }
  if (method === "GET" && path === "/api/notes") {
    const { results } = await env.DB.prepare(
      "SELECT id, title, content FROM notes ORDER BY id"
    ).all();
    return json(results);
  }

  const notePath = /^\/api\/notes\/([^/]+)$/.exec(path);
  if (notePath) {
    const id = validId(notePath[1]);
    if (!id) {
      return json({ error: "Note not found." }, 404);
    }

    if (method === "GET") {
      const note = await env.DB.prepare(
        "SELECT id, title, content FROM notes WHERE id = ?"
      ).bind(id).first();
      return note ? json(note) : json({ error: "Note not found." }, 404);
    }

    if (method === "POST" || method === "PUT" || method === "DELETE") {
      const user = await authenticateUser(request, env);
      if (!user) {
        return json({ error: "No valid user token provided." }, 401);
      }

      if (method === "DELETE") {
        const result = await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
        return result.meta.changes
          ? json({ message: "Note deleted." })
          : json({ error: "Note not found." }, 404);
      }
      if (method === "PUT") {
        const parsed = await readBody(request);
        if (parsed.error) {
          return json({ error: parsed.error }, 400);
        }
        const { title, content = "" } = parsed.body;
        if (typeof title !== "string" || !title.trim()) {
          return json({ error: "`title` is required." }, 400);
        }
        if (typeof content !== "string") {
          return json({ error: "`content` must be a string." }, 400);
        }
        const result = await env.DB.prepare(
          "UPDATE notes SET title = ?, content = ? WHERE id = ?"
        ).bind(title.trim(), content.trim(), id).run();
        if (!result.meta.changes) {
          return json({ error: "Note not found." }, 404);
        }
        const note = await env.DB.prepare(
          "SELECT id, title, content FROM notes WHERE id = ?"
        ).bind(id).first();
        return json(note);
      }
      return json({ error: "Method not allowed." }, 405);
    }
  }

  if (method === "POST" && path === "/api/notes") {
    const user = await authenticateUser(request, env);
    if (!user) {
      return json({ error: "No valid user token provided." }, 401);
    }
    const parsed = await readBody(request);
    if (parsed.error) {
      return json({ error: parsed.error }, 400);
    }
    const { title, content = "" } = parsed.body;
    if (typeof title !== "string" || !title.trim()) {
      return json({ error: "`title` is required." }, 400);
    }
    if (typeof content !== "string") {
      return json({ error: "`content` must be a string." }, 400);
    }
    const result = await env.DB.prepare(
      "INSERT INTO notes (title, content) VALUES (?, ?)"
    ).bind(title.trim(), content.trim()).run();
    const note = await env.DB.prepare(
      "SELECT id, title, content FROM notes WHERE id = ?"
    ).bind(Number(result.meta.last_row_id)).first();
    return json(note, 201);
  }

  return json({ error: "Not found." }, 404);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      if (request.headers.has("Origin") && !headers["Access-Control-Allow-Origin"]) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers });
    }
    if (request.headers.has("Origin") && !headers["Access-Control-Allow-Origin"]) {
      return json({ error: "Origin is not allowed." }, 403);
    }

    try {
      const response = await handleRequest(request, env);
      const responseHeaders = new Headers(response.headers);
      for (const [name, value] of Object.entries(headers)) {
        responseHeaders.set(name, value);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Notes API request failed:", error);
      return json(
        { error: "An unexpected server error occurred." },
        500,
        headers
      );
    }
  },
};
