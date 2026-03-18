import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Send, MessageSquare, User, Clock, Loader2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
      const method = editingPost ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setAuthor("");
        setEditingPost(null);
        fetchPosts();
      }
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setTitle("");
    setContent("");
    setAuthor("");
  };

  const deletePost = async (id: string) => {
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <MessageSquare size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">PostMaster</h1>
          </div>
          <div className="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Create Post Form */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-12"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {editingPost ? <MessageSquare className="text-emerald-600" size={20} /> : <Plus className="text-emerald-600" size={20} />}
            {editingPost ? "Edit Post" : "Create a New Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Author (Optional)</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Content</label>
              <textarea
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                required
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {editingPost ? "Update Post" : "Publish Post"}
              </button>
              {editingPost && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-8 py-3 bg-stone-100 text-stone-600 rounded-xl font-semibold hover:bg-stone-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.section>

        {/* Posts List */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Recent Activity</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-medium">Loading your feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-medium italic">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:border-emerald-200 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 mb-1">{post.title}</h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-stone-400">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(post.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(post)}
                        className="p-2 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-stone-200">
        <p className="text-center text-stone-400 text-sm">
          &copy; {new Date().getFullYear()} PostMaster. Built for creative minds.
        </p>
      </footer>
    </div>
  );
}
