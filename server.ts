import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ELITE INFRASTRUCTURE: REDIS-LIKE CACHE ---
class RedisCache {
  private cache = new Map<string, { value: any, expiry: number }>();

  set(key: string, value: any, ttlSeconds: number = 3600) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

const redis = new RedisCache();
const db = new Database("fastline.db");

// --- DATABASE INITIALIZATION ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    sync_status TEXT DEFAULT 'synced'
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    content TEXT,
    type TEXT,
    media_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    is_group INTEGER DEFAULT 0,
    name TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id TEXT,
    user_id TEXT,
    PRIMARY KEY(conversation_id, user_id),
    FOREIGN KEY(conversation_id) REFERENCES conversations(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    user_id TEXT,
    content TEXT,
    type TEXT DEFAULT 'text',
    media_url TEXT,
    status TEXT DEFAULT 'sent',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS message_reactions (
    message_id TEXT,
    user_id TEXT,
    emoji TEXT,
    PRIMARY KEY(message_id, user_id),
    FOREIGN KEY(message_id) REFERENCES messages(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'EN',
    notifications_enabled INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  -- Seed data if empty
  INSERT OR IGNORE INTO users (id, phone, name, avatar) VALUES ('user_1', '+255 123 456 789', 'Joseph Athanas', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph');
  INSERT OR IGNORE INTO users (id, phone, name, avatar) VALUES ('user_2', '+255 987 654 321', 'Sarah Kimani', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah');
  INSERT OR IGNORE INTO users (id, phone, name, avatar) VALUES ('user_3', '+255 555 666 777', 'David Mbeki', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David');

  INSERT OR IGNORE INTO conversations (id, is_group, name) VALUES ('conv_1', 0, 'Sarah Kimani');
  INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES ('conv_1', 'user_1');
  INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES ('conv_1', 'user_2');

  INSERT OR IGNORE INTO conversations (id, is_group, name) VALUES ('conv_2', 0, 'David Mbeki');
  INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES ('conv_2', 'user_1');
  INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES ('conv_2', 'user_3');

  INSERT OR IGNORE INTO groups (id, name, description) VALUES ('g1', 'Physics_Alpha', 'Advanced Physics Discussion');
  INSERT OR IGNORE INTO groups (id, name, description) VALUES ('g2', 'Class_2026_Main', 'Official Class Group');
  INSERT OR IGNORE INTO groups (id, name, description) VALUES ('g3', 'Tech_Hub_Local', 'Local Tech Community');
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  app.use(express.json());

  // --- REAL-TIME WEBSOCKET ENGINE ---
  io.on("connection", (socket) => {
    console.log("Client connected to JSL FastLine Mesh:", socket.id);
    
    socket.on("sync:start", (data) => {
      console.log("Sync initiated by node:", socket.id);
      // Simulate high-performance sync
      setTimeout(() => {
        socket.emit("sync:complete", { status: "success", nodes_reached: 4 });
      }, 1500);
    });

    socket.on("disconnect", () => {
      console.log("Node disconnected from mesh:", socket.id);
    });
  });

  // --- API ROUTES (PHASE 1: NODE.JS) ---
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "operational", 
      uptime: process.uptime(),
      cache: "active",
      mesh_nodes: io.engine.clientsCount
    });
  });

  app.get("/api/feed", (req, res) => {
    // Check cache first (Elite Level)
    const cachedFeed = redis.get("global_feed");
    if (cachedFeed) return res.json(cachedFeed);

    const posts = db.prepare(`
      SELECT posts.*, users.name as user_name, users.avatar as user_avatar 
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id 
      ORDER BY created_at DESC
    `).all();
    
    redis.set("global_feed", posts, 30); // Cache for 30s
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { id, user_id, content, type, media_url } = req.body;
    db.prepare("INSERT INTO posts (id, user_id, content, type, media_url) VALUES (?, ?, ?, ?, ?)")
      .run(id, user_id, content, type, media_url);
    res.json({ success: true });
  });

  app.get("/api/conversations", (req, res) => {
    const userId = 'user_1'; // Hardcoded for demo
    const conversations = db.prepare(`
      SELECT c.*, 
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ?
    `).all(userId);
    res.json(conversations);
  });

  app.get("/api/conversations/:convId/messages", (req, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as user_name, u.avatar as user_avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(req.params.convId);
    
    // Add reactions to each message
    const messagesWithReactions = messages.map((msg: any) => {
      const reactions = db.prepare("SELECT user_id, emoji FROM message_reactions WHERE message_id = ?").all(msg.id);
      return { ...msg, reactions };
    });
    
    res.json(messagesWithReactions);
  });

  app.post("/api/messages", (req, res) => {
    const { id, conversation_id, user_id, content, type, media_url } = req.body;
    db.prepare("INSERT INTO messages (id, conversation_id, user_id, content, type, media_url) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, conversation_id, user_id, content, type || 'text', media_url);
    res.json({ success: true });
  });

  app.post("/api/messages/:msgId/reactions", (req, res) => {
    const { user_id, emoji } = req.body;
    db.prepare("INSERT OR REPLACE INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)")
      .run(req.params.msgId, user_id, emoji);
    res.json({ success: true });
  });

  app.get("/api/groups", (req, res) => {
    const groups = db.prepare("SELECT * FROM groups").all();
    res.json(groups);
  });

  app.get("/api/groups/:groupId/messages", (req, res) => {
    const messages = db.prepare(`
      SELECT messages.*, users.name as user_name 
      FROM messages 
      JOIN users ON messages.user_id = users.id 
      WHERE group_id = ? 
      ORDER BY created_at ASC
    `).all(req.params.groupId);
    res.json(messages);
  });

  app.post("/api/sync", (req, res) => {
    const { actions } = req.body;
    // Simple sync logic: process each action
    // In a real app, this would be more robust with conflict resolution
    actions.forEach((action: any) => {
      if (action.type === 'post') {
        db.prepare("INSERT OR IGNORE INTO posts (id, user_id, content, type, media_url) VALUES (?, ?, ?, ?, ?)")
          .run(action.id, action.user_id, action.content, action.type, action.media_url);
      }
      // Add other action types...
    });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`JSL FastLine Core running on http://localhost:${PORT}`);
  });
}

startServer();
