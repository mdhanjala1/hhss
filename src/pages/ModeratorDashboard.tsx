import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Users, ImageIcon, ShoppingBag, DollarSign,
  CheckCircle, Clock, Search, AlertCircle,
  TrendingUp, RefreshCw, Package, Bell, ZoomIn, Star, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Artist, Artwork, Order } from '../types';

// মডারেটর ইমেইল তালিকা — .env থেকে পড়া হয়
const _ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
const MODERATOR_EMAILS: string[] = (import.meta.env.VITE_MODERATOR_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(e => Boolean(e) && e !== _ADMIN_EMAIL); // admin email moderator list-এ থাকলে বাদ দাও

export function isModeratorEmail(email: string): boolean {
  return MODERATOR_EMAILS.includes(email.trim().toLowerCase());
}

export default function ModeratorDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'artworks' | 'artists' | 'orders' | 'nid' | 'messages'>('stats');
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [pendingNid, setPendingNid] = useState<Artist[]>([]);
  const [pendingArt, setPendingArt] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ artists: 0, artworks: 0, pendingArtworks: 0, pendingNid: 0, totalRevenue: 0, orders: 0 });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [searchArt, setSearchArt] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [artFilter, setArtFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const navigate = useNavigate();

  useEffect(() => { initModerator(); }, []);

  const initModerator = async () => {
    await new Promise(r => setTimeout(r, 400));
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    const userEmail = (session.user.email || '').trim().toLowerCase();
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
    if (userEmail !== adminEmail && !isModeratorEmail(userEmail)) {
      toast.error(`অ্যাক্সেস নেই। (${userEmail})`);
      navigate('/');
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: allArts },
        { data: allArtists },
        { data: allOrders },
        { data: nidArtists },
      ] = await Promise.all([
        supabase.from('artworks').select('*, artist:artists(*)').order('created_at', { ascending: false }),
        supabase.from('artists').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, artwork:artworks(*), artist:artists(*)').order('created_at', { ascending: false }),
        supabase.from('artists').select('*').eq('verification_status', 'pending').order('created_at', { ascending: false }),
      ]);
      const arts = allArts || [];
      const pending = arts.filter(a => a.status === 'pending');
      const revenue = (allOrders || []).filter(o => o.status === 'delivered').reduce((s, o) => s + (o.artwork_price || 0), 0);
      setAllArtworks(arts); setPendingArt(pending);
      setArtists(allArtists || []); setOrders(allOrders || []); setPendingNid(nidArtists || []);
      const { data: msgs } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      setContactMessages(msgs || []);
      setStats({ artists: (allArtists || []).length, artworks: arts.length, pendingArtworks: pending.length, pendingNid: (nidArtists || []).length, totalRevenue: revenue, orders: (allOrders || []).length });
    } catch (e: any) { toast.error('ডেটা লোড হয়নি: ' + e.message); }
    finally { setLoading(false); }
  };

  // ✅ শুধু APPROVE করতে পারবে, DELETE/REJECT নয়
  const handleArtworkApprove = async (id: string, artistId?: string) => {
    const { error } = await supabase.from('artworks').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('আপডেট ব্যর্থ: ' + error.message); return; }
    if (artistId) {
      await supabase.from('notifications').insert({ artist_id: artistId, title: 'শিল্পকর্ম অনুমোদিত ✅', message: 'আপনার শিল্পকর্মটি মার্কেটপ্লেসে প্রকাশিত হয়েছে।', is_read: false, created_at: new Date().toISOString() });
    }
    toast.success('✅ অনুমোদিত!'); fetchData();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('artworks').update({ is_featured: !current }).eq('id', id);
    if (!error) toast.success(!current ? '⭐ ফিচার্ড করা হয়েছে!' : 'ফিচার্ড বাতিল করা হয়েছে');
    fetchData();
  };

  // ✅ শুধু VERIFY করতে পারবে, Unverify নয়
  const handleArtistVerify = async (id: string) => {
    const { error } = await supabase.from('artists').update({ is_verified: true, verification_status: 'verified' }).eq('id', id);
    if (error) { toast.error('ভেরিফাই ব্যর্থ: ' + error.message); return; }
    await supabase.from('notifications').insert({ artist_id: id, title: '🎉 অ্যাকাউন্ট ভেরিফাইড!', message: 'অভিনন্দন! আপনার অ্যাকাউন্ট ভেরিফাইড হয়েছে।', is_read: false, created_at: new Date().toISOString() });
    toast.success('✅ ভেরিফাইড!'); fetchData();
  };

  const filteredArtworks = allArtworks.filter(a => {
    const ms = !searchArt || a.title.toLowerCase().includes(searchArt.toLowerCase()) || a.artist?.full_name?.toLowerCase().includes(searchArt.toLowerCase());
    return ms && (artFilter === 'all' || a.status === artFilter);
  });
  const filteredArtists = artists.filter(a => !searchArtist || a.full_name.toLowerCase().includes(searchArtist.toLowerCase()) || a.district?.toLowerCase().includes(searchArtist.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4" />
        <p style={{ color: 'var(--text3)' }}>লোড হচ্ছে...</p>
      </div>
    </div>
  );

  const TABS = [
    { id: 'stats', label: 'ড্যাশবোর্ড', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'artworks', label: 'শিল্পকর্ম', icon: <ImageIcon className="w-4 h-4" />, badge: stats.pendingArtworks },
    { id: 'artists', label: 'শিল্পীগণ', icon: <Users className="w-4 h-4" /> },
    { id: 'orders', label: 'অর্ডার', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'nid', label: 'NID যাচাই', icon: <ShieldCheck className="w-4 h-4" />, badge: stats.pendingNid },
    { id: 'messages', label: 'বার্তা', icon: <Bell className="w-4 h-4" />, badge: contactMessages.filter(m => !m.is_read).length },
  ] as const;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside className="w-64 text-white shrink-0 flex flex-col" style={{ background: 'var(--dark)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(194,160,110,0.18)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--bg)' }}>Moderator Panel</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>শিল্পশপ</p>
            </div>
          </div>
          {/* মডারেটর সীমাবদ্ধতা নোট */}
          <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>
            📋 শুধু অনুমোদন ও যাচাইয়ের অধিকার আছে
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-semibold"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, var(--accent), var(--accent-dk))' : 'transparent',
                color: activeTab === tab.id ? 'var(--dark)' : 'var(--text3)',
              }}>
              <span className="flex items-center gap-3">{tab.icon}{tab.label}</span>
              {tab.badge && tab.badge > 0 ? <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(194,160,110,0.18)' }}>
          <button onClick={fetchData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--accent)' }}>
            <RefreshCw className="w-4 h-4" /> রিফ্রেশ করুন
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-5 flex items-center justify-between border-b"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {activeTab === 'stats' && 'মডারেটর ড্যাশবোর্ড'}
            {activeTab === 'artworks' && `শিল্পকর্ম ব্যবস্থাপনা${stats.pendingArtworks > 0 ? ` (${stats.pendingArtworks}টি অপেক্ষমাণ)` : ''}`}
            {activeTab === 'artists' && 'শিল্পী ব্যবস্থাপনা'}
            {activeTab === 'orders' && 'অর্ডার দেখুন'}
            {activeTab === 'nid' && `NID যাচাই${stats.pendingNid > 0 ? ` (${stats.pendingNid}টি অপেক্ষমাণ)` : ''}`}
            {activeTab === 'messages' && `বার্তাসমূহ (${contactMessages.length})`}
          </h1>
        </div>

        <div className="p-8">

          {/* STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: 'মোট শিল্পী', value: stats.artists, icon: <Users className="w-6 h-6" />, ib: 'rgba(59,130,246,0.12)', ic: '#3b82f6' },
                  { label: 'মোট শিল্পকর্ম', value: stats.artworks, icon: <ImageIcon className="w-6 h-6" />, ib: 'rgba(139,92,246,0.12)', ic: '#8b5cf6' },
                  { label: 'অপেক্ষমাণ', value: stats.pendingArtworks, icon: <Clock className="w-6 h-6" />, ib: 'rgba(245,158,11,0.12)', ic: '#f59e0b', action: () => setActiveTab('artworks') },
                  { label: 'মোট অর্ডার', value: stats.orders, icon: <ShoppingBag className="w-6 h-6" />, ib: 'rgba(194,160,110,0.12)', ic: 'var(--accent)' },
                  { label: 'NID অপেক্ষমাণ', value: stats.pendingNid, icon: <ShieldCheck className="w-6 h-6" />, ib: 'rgba(239,68,68,0.12)', ic: '#ef4444', action: () => setActiveTab('nid') },
                  { label: 'মোট আয়', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, ib: 'rgba(16,185,129,0.12)', ic: '#10b981' },
                ].map((s, i) => (
                  <div key={i} onClick={s.action}
                    className="rounded-2xl border p-6 flex items-center gap-4 transition-all hover:shadow-md"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', cursor: s.action ? 'pointer' : 'default' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: s.ib, color: s.ic }}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {stats.pendingArtworks > 0 && (
                <div className="rounded-2xl p-5 border flex items-center justify-between"
                  style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <h3 className="font-bold flex items-center gap-2" style={{ color: '#92400e' }}>
                    <AlertCircle className="w-5 h-5" />{stats.pendingArtworks}টি শিল্পকর্ম অনুমোদনের অপেক্ষায়
                  </h3>
                  <button onClick={() => setActiveTab('artworks')}
                    className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                    এখনই দেখুন
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ARTWORKS — শুধু Approve, featured toggle; reject/delete নেই */}
          {activeTab === 'artworks' && (
            <div>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
                  <input type="text" placeholder="নাম বা শিল্পী খুঁজুন..." value={searchArt} onChange={e => setSearchArt(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl outline-none text-sm border"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
                {(['pending', 'approved', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setArtFilter(f)}
                    className="px-4 py-3 rounded-2xl text-sm font-bold transition-all border"
                    style={{
                      background: artFilter === f ? 'linear-gradient(135deg, var(--accent), var(--accent-dk))' : 'var(--card)',
                      borderColor: artFilter === f ? 'transparent' : 'var(--border)',
                      color: artFilter === f ? 'var(--dark)' : 'var(--text2)',
                    }}>
                    {f === 'pending' ? `অপেক্ষমাণ (${pendingArt.length})` : f === 'approved' ? 'অনুমোদিত' : 'সবগুলো'}
                  </button>
                ))}
              </div>
              {filteredArtworks.length === 0 ? (
                <div className="rounded-2xl border py-20 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                  <p className="font-medium" style={{ color: 'var(--text2)' }}>কোনো শিল্পকর্ম নেই</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredArtworks.map(art => (
                    <div key={art.id} className="rounded-2xl border overflow-hidden transition-all hover:shadow-md"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex gap-0 items-stretch">
                        <div className="relative shrink-0 cursor-zoom-in group w-36 sm:w-44"
                          onClick={() => setLightboxImg(art.image_url)}>
                          <img src={art.image_url} alt={art.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '140px', background: 'var(--bg)' }} />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(26,14,5,0.5)' }}>
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>{art.title}</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>{art.artist?.full_name} · {art.category}</p>
                                <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>৳{art.price?.toLocaleString()}</p>
                              </div>
                              <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold"
                                style={art.status === 'approved'
                                  ? { background: 'rgba(194,160,110,0.12)', color: 'var(--accent-dk)' }
                                  : { background: 'rgba(245,158,11,0.12)', color: '#b45309' }}>
                                {art.status === 'approved' ? '✅ অনুমোদিত' : '⏳ অপেক্ষমাণ'}
                              </span>
                            </div>
                            {art.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text3)' }}>{art.description}</p>}
                            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{art.created_at ? format(new Date(art.created_at), 'dd MMM yyyy') : ''}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {art.status === 'pending' && (
                              <button onClick={() => handleArtworkApprove(art.id, art.artist_id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                                <CheckCircle className="w-4 h-4" /> অনুমোদন করুন
                              </button>
                            )}
                            <button onClick={() => handleToggleFeatured(art.id, art.is_featured || false)}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all border"
                              style={art.is_featured
                                ? { background: 'rgba(234,179,8,0.15)', borderColor: 'rgba(234,179,8,0.5)', color: '#b45309' }
                                : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text3)' }}>
                              <Star className="w-3.5 h-3.5" fill={art.is_featured ? '#b45309' : 'none'} />
                              {art.is_featured ? 'ফিচার্ড সরান' : 'ফিচার্ড করুন'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ARTISTS — শুধু Verify, Unverify নেই */}
          {activeTab === 'artists' && (
            <div>
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
                <input type="text" placeholder="শিল্পী খুঁজুন..." value={searchArtist} onChange={e => setSearchArtist(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl outline-none text-sm border"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid gap-3">
                {filteredArtists.map(artist => (
                  <div key={artist.id} className="rounded-2xl border p-5 flex items-center gap-4 transition-all hover:shadow-md"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                      alt={artist.full_name} className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ background: 'var(--bg)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold" style={{ color: 'var(--text)' }}>{artist.full_name}</h3>
                        {artist.is_verified
                          ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(194,160,110,0.12)', color: 'var(--accent-dk)' }}><ShieldCheck className="w-3 h-3" />Verified</span>
                          : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--bg)', color: 'var(--text3)' }}>Unverified</span>}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text3)' }}>{artist.email} · {artist.district}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{artist.total_sales} বিক্রয় · {format(new Date(artist.created_at || Date.now()), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="shrink-0">
                      {!artist.is_verified ? (
                        <button onClick={() => handleArtistVerify(artist.id)}
                          className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                          ✅ ভেরিফাই করুন
                        </button>
                      ) : (
                        <span className="px-4 py-2.5 rounded-xl font-bold text-sm block text-center"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                          ✓ ভেরিফাইড
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS — শুধু দেখা যাবে */}
          {activeTab === 'orders' && (
            <div>
              <div className="mb-4 px-4 py-3 rounded-2xl text-sm flex items-center gap-2" style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Eye className="w-4 h-4 shrink-0" /> অর্ডারগুলো শুধু দেখার অধিকার আছে। স্ট্যাটাস পরিবর্তন করতে হলে এডমিনকে অনুরোধ করুন।
              </div>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border py-20 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                    <p style={{ color: 'var(--text2)' }}>কোনো অর্ডার নেই</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className="rounded-2xl border p-5 flex items-center gap-4"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <img src={order.artwork?.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ background: 'var(--bg)' }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{order.artwork?.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{order.customer_name} · {order.customer_phone}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{order.customer_address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold" style={{ color: 'var(--accent)' }}>৳{order.artwork_price?.toLocaleString()}</p>
                      <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={order.status === 'delivered' ? { background: 'rgba(194,160,110,0.12)', color: 'var(--accent-dk)' }
                          : order.status === 'cancelled' ? { background: 'rgba(239,68,68,0.1)', color: '#dc2626' }
                          : { background: 'rgba(245,158,11,0.1)', color: '#b45309' }}>
                        {order.status}
                      </span>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text3)' }}>{order.created_at ? format(new Date(order.created_at), 'dd MMM yy') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NID — শুধু Verify */}
          {activeTab === 'nid' && (
            <div>
              {pendingNid.length === 0 ? (
                <div className="rounded-2xl border py-20 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                  <p className="font-medium" style={{ color: 'var(--text2)' }}>কোনো NID যাচাই অপেক্ষমাণ নেই</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingNid.map(artist => (
                    <div key={artist.id} className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start gap-5 flex-wrap">
                        <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                          alt={artist.full_name} className="w-16 h-16 rounded-xl object-cover shrink-0" style={{ background: 'var(--bg)' }} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{artist.full_name}</h3>
                          <p className="text-sm" style={{ color: 'var(--text3)' }}>{artist.email} · {artist.phone}</p>
                          <p className="text-sm" style={{ color: 'var(--text3)' }}>{artist.district}</p>
                          {artist.nid_number && <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text)' }}>
                            {artist.nid_name?.startsWith('[জন্ম নিবন্ধন]') ? '📄 জন্ম নিবন্ধন নম্বর: ' : '🪪 NID: '}
                            {artist.nid_number}
                          </p>}
                          {artist.nid_name && <p className="text-sm" style={{ color: 'var(--text2)' }}>
                            নাম: {artist.nid_name?.replace('[NID] ', '').replace('[জন্ম নিবন্ধন] ', '')}
                          </p>}
                        </div>
                        {artist.nid_photo_url && (
                          <div className="shrink-0 cursor-zoom-in group relative"
                            onClick={() => setLightboxImg(artist.nid_photo_url!)}>
                            <img src={artist.nid_photo_url} alt="NID"
                              className="w-40 h-24 rounded-xl object-cover border transition-all group-hover:opacity-80"
                              style={{ borderColor: 'var(--border)' }} />
                            <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'rgba(26,14,5,0.45)' }}>
                              <ZoomIn className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-xs text-center mt-1 font-medium" style={{ color: 'var(--accent)' }}>🔍 NID ফটো — বড় করুন</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                        <button onClick={() => handleArtistVerify(artist.id)}
                          className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                          <CheckCircle className="w-4 h-4" /> ভেরিফাই করুন
                        </button>
                        <span className="flex items-center gap-2 px-4 py-3 text-sm rounded-xl"
                          style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                          ❌ বাতিলের অধিকার নেই — এডমিনকে জানান
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES — পড়া এবং পঠিত চিহ্নিত করা */}
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {contactMessages.length === 0 ? (
                <div className="rounded-2xl border py-20 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                  <p style={{ color: 'var(--text2)' }}>কোনো বার্তা নেই</p>
                </div>
              ) : contactMessages.map(msg => (
                <div key={msg.id} className="rounded-2xl border p-5 transition-all hover:shadow-md"
                  style={{
                    background: msg.is_read ? 'var(--card)' : 'rgba(194,160,110,0.04)',
                    borderColor: msg.is_read ? 'var(--border)' : 'rgba(194,160,110,0.35)',
                  }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                        <h3 className="font-bold" style={{ color: 'var(--text)' }}>{msg.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--bg)', color: 'var(--text3)' }}>{msg.subject}</span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{msg.message}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-2">
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{msg.created_at ? new Date(msg.created_at).toLocaleDateString('bn-BD') : ''}</p>
                      {!msg.is_read && (
                        <button onClick={async () => { await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id); fetchData(); }}
                          className="block w-full px-3 py-1.5 text-xs font-bold rounded-xl transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                          পঠিত চিহ্নিত করুন
                        </button>
                      )}
                      <a href={`mailto:${msg.email}`}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
                        style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
                        উত্তর দিন
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxImg(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}>
              <img src={lightboxImg} alt="বড় ছবি"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
