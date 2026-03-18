import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

const POSTS_FILE = path.join(process.cwd(), "posts.json");

async function initStorage() {
  try {
    await fs.access(POSTS_FILE);
  } catch {
    await fs.writeFile(POSTS_FILE, JSON.stringify([]));
  }
}

async function startServer() {
  await initStorage();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", async (req, res) => {
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/posts", async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    const posts = JSON.parse(data);
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      author: author || "Anonymous",
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(201).json(newPost);
  });

  app.put("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    let posts = JSON.parse(data);
    const index = posts.findIndex((p: any) => p.id === id);
    if (index === -1) return res.status(404).json({ error: "Post not found" });
    
    posts[index] = {
      ...posts[index],
      title,
      content,
      author: author || "Anonymous",
      updatedAt: new Date().toISOString(),
    };
    
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.json(posts[index]);
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    let posts = JSON.parse(data);
    posts = posts.filter((p: any) => p.id !== id);
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
