import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { communityApi } from '../lib/api';
import {
  MessageSquare, ThumbsUp, Eye, Search, Plus, Tag, Clock,
  Loader2, ChevronDown, X, Send, BookOpen, TrendingUp, Users
} from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'blue' },
  { value: 'interview_tips', label: 'Interview Tips', color: 'emerald' },
  { value: 'career_advice', label: 'Career Advice', color: 'amber' },
  { value: 'company_reviews', label: 'Company Reviews', color: 'violet' },
  { value: 'job_search', label: 'Job Search', color: 'rose' },
  { value: 'study_groups', label: 'Study Groups', color: 'cyan' },
];

const CAT_COLOR: Record<string, string> = {
  general: 'bg-blue-500/20 text-blue-300',
  interview_tips: 'bg-emerald-500/20 text-emerald-300',
  career_advice: 'bg-amber-500/20 text-amber-300',
  company_reviews: 'bg-violet-500/20 text-violet-300',
  job_search: 'bg-rose-500/20 text-rose-300',
  study_groups: 'bg-cyan-500/20 text-cyan-300',
};

const SEED_POSTS = [
  {
    id: 's1',
    title: 'How I cracked Google SWE-2 after 5 rejections',
    content: 'After failing 5 times, I finally cracked Google. Here are the top 10 changes I made to my preparation...',
    category: 'interview_tips',
    tags: ['google', 'swe', 'coding'],
    upvotes: 342,
    views: 12450,
    reply_count: 67,
    author: 'Priya S.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_pinned: true,
  },
  {
    id: 's2',
    title: 'AMA: 10-year veteran PM at top product companies',
    content: 'Worked at Amazon, Flipkart, and now Meesho. Ask me anything about product management careers...',
    category: 'career_advice',
    tags: ['product', 'pm', 'career'],
    upvotes: 218,
    views: 8900,
    reply_count: 142,
    author: 'Rahul M.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_pinned: false,
  },
  {
    id: 's3',
    title: 'Razorpay interview experience - all rounds breakdown',
    content: 'Just cleared all 6 rounds at Razorpay. Sharing my experience: Round 1 was DS/Algo...',
    category: 'company_reviews',
    tags: ['razorpay', 'fintech', 'interview'],
    upvotes: 189,
    views: 6700,
    reply_count: 34,
    author: 'Deepa I.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    is_pinned: false,
  },
  {
    id: 's4',
    title: 'System Design Study Group - Week 5: Distributed Caching',
    content: 'Join this week\'s system design session. We\'ll cover Redis, Memcached, and CDN caching strategies...',
    category: 'study_groups',
    tags: ['system-design', 'study', 'caching'],
    upvotes: 76,
    views: 3400,
    reply_count: 28,
    author: 'Arjun P.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_pinned: false,
  },
];

function NewPostModal({ onClose, onPost }: { onClose: () => void; onPost: (data: any) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }

  function handlePost() {
    if (!title.trim() || !content.trim()) return;
    onPost({ title, content, category, tags });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Create Post</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="A descriptive title for your post..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              rows={6} placeholder="Share your knowledge, experience or question..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              <button onClick={addTag} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-slate-700 text-slate-300 rounded-full px-3 py-1 text-sm">
                  #{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all">Cancel</button>
            <button onClick={handlePost} disabled={!title.trim() || !content.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(SEED_POSTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    communityApi.getAll().then(data => {
      if (data && data.length > 0) {
        setPosts(prev => [...prev, ...data.filter(d => !prev.find(p => p.id === d.id)) as any]);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [user]);

  async function handleNewPost(data: any) {
    if (!user) return;
    try {
      const post = await communityApi.create(data);
      if (post) {
        setPosts(prev => [{ ...post, author: user.full_name, upvotes: 0, views: 0, reply_count: 0 } as any, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
    setShowNewPost(false);
  }

  function toggleLike(postId: string) {
    setLikedPosts(prev => prev.includes(postId) ? prev.filter(p => p !== postId) : [...prev, postId]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: likedPosts.includes(postId) ? p.upvotes - 1 : p.upvotes + 1 } : p));
    communityApi.like(postId).catch(() => {});
  }

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p as any).tags?.some((t: string) => t.includes(q));
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-slate-400 text-sm mt-1">Share, learn, and grow with the ReferAI community</p>
        </div>
        <button onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Members', value: '52K+', icon: Users, color: 'blue' },
          { label: 'Posts', value: '12K+', icon: BookOpen, color: 'emerald' },
          { label: 'Active Today', value: '1.2K', icon: TrendingUp, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-4 text-center`}>
            <Icon className={`w-5 h-5 text-${color}-400 mx-auto mb-2`} />
            <div className="text-white font-bold text-xl">{value}</div>
            <div className="text-slate-400 text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none pr-9 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategoryFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!categoryFilter ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategoryFilter(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${categoryFilter === c.value ? CAT_COLOR[c.value] : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className="bg-slate-900 border border-white/10 hover:border-blue-500/20 rounded-2xl p-5 cursor-pointer transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleLike(post.id)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${likedPosts.includes(post.id) ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}>
                    <ThumbsUp className="w-4 h-4" fill={likedPosts.includes(post.id) ? 'currentColor' : 'none'} />
                    <span className="text-xs font-bold">{post.upvotes}</span>
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {post.is_pinned && (
                      <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Pinned</span>
                    )}
                    <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">{post.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${CAT_COLOR[post.category] ?? 'bg-slate-700 text-slate-300'}`}>
                      {CATEGORIES.find(c => c.value === post.category)?.label ?? post.category}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Eye className="w-3.5 h-3.5" /> {post.views?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" /> {post.reply_count}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-slate-500 text-xs">by {(post as any).author ?? 'Community Member'}</div>
                  </div>
                  {(post as any).tags && (post as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(post as any).tags.map((t: string) => (
                        <span key={t} className="text-slate-500 text-xs">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewPost && user && (
        <NewPostModal onClose={() => setShowNewPost(false)} onPost={handleNewPost} />
      )}
    </div>
  );
}
