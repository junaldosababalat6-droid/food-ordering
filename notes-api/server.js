import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("Set JWT_SECRET to a random value at least 32 characters long.");
}

const db = new DatabaseSync(fileURLToPath(new URL("./notes.db", import.meta.url)));

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
`);

const app = express();

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: "16kb" }));

function requireAuth(req, res, next) {
  const authorization = req.get("Authorization");
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  const authorization = req.get("Authorization");
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Admin login is required." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access is required." });
    }

    const admin = db.prepare("SELECT id, username FROM admin_users WHERE id = ?").get(decoded.id);
    if (!admin || admin.username !== decoded.username) {
      return res.status(401).json({ error: "Invalid or expired admin session." });
    }

    req.admin = admin;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session." });
  }
}

function parseNoteId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

app.get("/api/admin/bootstrap-status", (req, res) => {
  const admin = db.prepare("SELECT id FROM admin_users LIMIT 1").get();
  return res.json({ adminExists: Boolean(admin) });
});

app.post(
  "/api/admin/register",
  (req, res, next) => {
    const admin = db.prepare("SELECT id FROM admin_users LIMIT 1").get();
    if (!admin) {
      return next();
    }
    return requireAdmin(req, res, next);
  },
  async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Admin password must be at least 8 characters." });
      }

      const normalizedUsername = username.trim();
      const passwordHash = await bcrypt.hash(password, 12);
      db.exec("BEGIN IMMEDIATE");
      let result;
      try {
        const existingAdmin = db.prepare("SELECT id FROM admin_users LIMIT 1").get();
        if (existingAdmin && !req.admin) {
          db.exec("ROLLBACK");
          return res.status(403).json({ error: "Only an authenticated admin can register another admin." });
        }

        const existingUsername = db
          .prepare("SELECT id FROM admin_users WHERE username = ?")
          .get(normalizedUsername);
        if (existingUsername) {
          db.exec("ROLLBACK");
          return res.status(409).json({ error: "Admin username already exists." });
        }

        const inserted = db
          .prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)")
          .run(normalizedUsername, passwordHash);
        result = { id: Number(inserted.lastInsertRowid) };
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }

      return res.status(201).json({ id: result.id, username: normalizedUsername });
    } catch (error) {
      return next(error);
    }
  }
);

app.post("/api/admin/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const admin = db
      .prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ?")
      .get(username.trim());
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      jwtSecret,
      { expiresIn: "1h" }
    );
    return res.json({ token, username: admin.username });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  return res.json({ id: req.admin.id, username: req.admin.username });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedUsername = username.trim();
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(normalizedUsername);
    if (existing) {
      return res.status(409).json({ error: "Username already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
      .run(normalizedUsername, passwordHash);

    return res.status(201).json({ id: Number(result.lastInsertRowid), username: normalizedUsername });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = db
      .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
      .get(username.trim());
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/notes", (req, res) => {
  const notes = db.prepare("SELECT id, title, content FROM notes ORDER BY id").all();
  return res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const id = parseNoteId(req.params.id);
  const note = id && db.prepare("SELECT id, title, content FROM notes WHERE id = ?").get(id);

  if (!note) {
    return res.status(404).json({ error: "Note not found." });
  }

  return res.json(note);
});

app.post("/api/notes", requireAuth, (req, res) => {
  const { title, content = "" } = req.body || {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "`title` is required." });
  }
  if (typeof content !== "string") {
    return res.status(400).json({ error: "`content` must be a string." });
  }

  const result = db
    .prepare("INSERT INTO notes (title, content) VALUES (?, ?)")
    .run(title.trim(), content.trim());
  const note = db
    .prepare("SELECT id, title, content FROM notes WHERE id = ?")
    .get(Number(result.lastInsertRowid));

  return res.status(201).json(note);
});

app.put("/api/notes/:id", requireAuth, (req, res) => {
  const id = parseNoteId(req.params.id);
  const { title, content = "" } = req.body || {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "`title` is required." });
  }
  if (typeof content !== "string") {
    return res.status(400).json({ error: "`content` must be a string." });
  }
  if (!id) {
    return res.status(404).json({ error: "Note not found." });
  }

  const result = db
    .prepare("UPDATE notes SET title = ?, content = ? WHERE id = ?")
    .run(title.trim(), content.trim(), id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found." });
  }

  const note = db.prepare("SELECT id, title, content FROM notes WHERE id = ?").get(id);
  return res.json(note);
});

app.delete("/api/notes/:id", requireAuth, (req, res) => {
  const id = parseNoteId(req.params.id);

  if (!id) {
    return res.status(404).json({ error: "Note not found." });
  }

  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found." });
  }

  return res.json({ message: "Note deleted." });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(port, () => {
  console.log(`Notes API running at http://localhost:${port}`);
});
