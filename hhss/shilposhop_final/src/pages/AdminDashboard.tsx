import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Users, ImageIcon, ShoppingBag, DollarSign,
  CheckCircle, XCircle, Clock, Search, Eye, AlertCircle,
  TrendingUp, RefreshCw, ChevronDown, Package, Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Artist, Artwork, Order } from '../types';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'artworks' | 'artists' | 'orders' | 'nid' | 'messages'>('stats');
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [pendingNid, setPendingNid] = useState<Artist[]>([]);
  const [pendingArt, setPendingArt] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ artists: 0, artworks: 0, pendingArtworks: 0, pendingNid: 0, totalRevenue: 0, orders: 0 });
  const [searchArt, setSearchArt] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [artFilter, setArtFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedNidArtist, setSelectedNidArtist] = useState<Artist | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initAdmin();
  }, []);

  const initAdmin = async () => {
    await new Promise(r => setTimeout(r, 400));
    const { data: { session } } = await supabase.auth.getSession();
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com').trim().toLowerCase();
    if (!session) { navigate('/login'); return; }
    const userEmail = (session.user.email || '').trim().toLowerCase();
    if (userEmail !== adminEmail) {
      toast.error(`অ্যাক্সেস নেই। শুধু admin ঢুকতে পারবেন। (${userEmail})`);
      navigate('/');
      return;
    }
    fetchAdminData();
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [
        { data: allArts, error: artErr },
        { data: allArtists },
        { data: allOrders },
        { data: nidArtists },
      ] = await Promise.all([
        supabase.from('artworks').select('*, artist:artists(*)').order('created_at', { ascending: false }),
        supabase.from('artists').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, artwork:artworks(*), artist:artists(*)').order('created_at', { ascending: false }),
        supabase.from('artists').select('*').eq('verification_status', 'pending').order('created_at', { ascending: false }),
      ]);

      if (artErr) console.error('Artwork fetch error:', artErr);

      const arts = allArts || [];
      const pending = arts.filter(a => a.status === 'pending');
      const revenue = (allOrders || []).filter(o => o.status === 'delivered').reduce((s, o) => s + (o.artwork_price || 0), 0);

      setAllArtworks(arts);
      setPendingArt(pending);
      setArtists(allArtists || []);
      setOrders(allOrders || []);
      setPendingNid(nidArtists || []);

      // Fetch contact messages
      const { data: msgs } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      setContactMessages(msgs || []);
      setStats({
        artists: (allArtists || []).length,
        artworks: arts.length,
        pendingArtworks: pending.length,
        pendingNid: (nidArtists || []).length,
        totalRevenue: revenue,
        orders: (allOrders || []).length,
      });
    } catch (e: any) {
      toast.error('ডেটা লোড হয়নি: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleArtworkStatus = async (id: string, status: 'approved' | 'rejected', artistId?: string) => {
    const { error } = await supabase.from('artworks').update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    }).eq('id', id);

    if (error) { toast.error('আপডেট ব্যর্থ: ' + error.message); return; }

    // Send notification to artist
    if (artistId) {
      await supabase.from('notifications').insert({
        artist_id: artistId,
        title: status === 'approved' ? 'শিল্পকর্ম অনুমোদিত ✅' : 'শিল্পকর্ম বাতিল ❌',
        message: status === 'approved'
          ? 'আপনার শিল্পকর্মটি অনুমোদন পেয়েছে এবং মার্কেটপ্লেসে প্রকাশিত হয়েছে।'
          : 'আপনার শিল্পকর্মটি অনুমোদন পায়নি। পুনরায় আপলোড করুন।',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    toast.success(status === 'approved' ? '✅ শিল্পকর্ম অনুমোদিত হয়েছে!' : '❌ শিল্পকর্ম বাতিল হয়েছে');
    fetchAdminData();
  };

  const handleArtistVerify = async (id: string, verify: boolean) => {
    const { error } = await supabase.from('artists').update({
      is_verified: verify,
      verification_status: verify ? 'verified' : 'rejected',
    }).eq('id', id);

    if (error) { toast.error('ভেরিফাই ব্যর্থ: ' + error.message); return; }

    // Notify artist
    await supabase.from('notifications').insert({
      artist_id: id,
      title: verify ? '🎉 অ্যাকাউন্ট ভেরিফাইড!' : 'ভেরিফিকেশন বাতিল',
      message: verify
        ? 'অভিনন্দন! আপনার অ্যাকাউন্ট ভেরিফাইড হয়েছে। এখন শিল্পকর্ম আপলোড করতে পারবেন।'
        : 'আপনার ভেরিফিকেশন বাতিল করা হয়েছে। সঠিক NID দিয়ে পুনরায় আবেদন করুন।',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    toast.success(verify ? '✅ শিল্পী ভেরিফাইড!' : '❌ ভেরিফিকেশন বাতিল');
    setSelectedNidArtist(null);
    fetchAdminData();
  };

  const handleNidVerify = async (artistId: string, approve: boolean) => {
    await handleArtistVerify(artistId, approve);
  };

  const filteredArtworks = allArtworks.filter(a => {
    const matchSearch = !searchArt || a.title.toLowerCase().includes(searchArt.toLowerCase()) || a.artist?.full_name?.toLowerCase().includes(searchArt.toLowerCase());
    const matchFilter = artFilter === 'all' || a.status === artFilter;
    return matchSearch && matchFilter;
  });

  const filteredArtists = artists.filter(a =>
    !searchArtist || a.full_name.toLowerCase().includes(searchArtist.toLowerCase()) || a.district?.toLowerCase().includes(searchArtist.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
        <p className="text-stone-500">লোড হচ্ছে...</p>
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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white shrink-0 flex flex-col">
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <p className="text-stone-400 text-xs">শিল্পশপ</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}>
              <span className="flex items-center gap-3">{tab.icon}{tab.label}</span>
              {tab.badge && tab.badge > 0 ? <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-800">
          <button onClick={fetchAdminData} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-all">
            <RefreshCw className="w-4 h-4" /> রিফ্রেশ করুন
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-stone-100 px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">
            {activeTab === 'stats' && 'ড্যাশবোর্ড'}
            {activeTab === 'artworks' && `শিল্পকর্ম ব্যবস্থাপনা ${stats.pendingArtworks > 0 ? `(${stats.pendingArtworks}টি অপেক্ষমাণ)` : ''}`}
            {activeTab === 'artists' && 'শিল্পী ব্যবস্থাপনা'}
            {activeTab === 'orders' && 'অর্ডার ব্যবস্থাপনা'}
            {activeTab === 'nid' && `NID যাচাই ${stats.pendingNid > 0 ? `(${stats.pendingNid}টি অপেক্ষমাণ)` : ''}`}
            {activeTab === 'messages' && `বার্তাসমূহ (${contactMessages.length})`}
          </h1>
        </div>

        <div className="p-8">

          {/* ─── STATS TAB ─── */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: 'মোট শিল্পী', value: stats.artists, icon: <Users className="w-6 h-6" />, color: 'text-blue-600 bg-blue-50' },
                  { label: 'মোট শিল্পকর্ম', value: stats.artworks, icon: <ImageIcon className="w-6 h-6" />, color: 'text-purple-600 bg-purple-50' },
                  { label: 'অপেক্ষমাণ শিল্পকর্ম', value: stats.pendingArtworks, icon: <Clock className="w-6 h-6" />, color: 'text-amber-600 bg-amber-50', action: () => setActiveTab('artworks') },
                  { label: 'মোট অর্ডার', value: stats.orders, icon: <ShoppingBag className="w-6 h-6" />, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'NID অপেক্ষমাণ', value: stats.pendingNid, icon: <ShieldCheck className="w-6 h-6" />, color: 'text-red-600 bg-red-50', action: () => setActiveTab('nid') },
                  { label: 'মোট আয়', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-emerald-700 bg-emerald-50' },
                ].map((s, i) => (
                  <div key={i} onClick={s.action} className={`bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-4 ${s.action ? 'cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-stone-900">{s.value}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick pending artworks */}
              {stats.pendingArtworks > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{stats.pendingArtworks}টি শিল্পকর্ম অনুমোদনের অপেক্ষায়</h3>
                    <button onClick={() => setActiveTab('artworks')} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all">এখনই দেখুন</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ARTWORKS TAB ─── */}
          {activeTab === 'artworks' && (
            <div>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" placeholder="নাম বা শিল্পী খুঁজুন..." value={searchArt} onChange={e => setSearchArt(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
                {(['pending','approved','rejected','all'] as const).map(f => (
                  <button key={f} onClick={() => setArtFilter(f)}
                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${artFilter === f ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>
                    {f === 'pending' ? `অপেক্ষমাণ (${pendingArt.length})` : f === 'approved' ? 'অনুমোদিত' : f === 'rejected' ? 'বাতিল' : 'সবগুলো'}
                  </button>
                ))}
              </div>

              {filteredArtworks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 py-20 text-center">
                  <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-medium">কোনো শিল্পকর্ম নেই</p>
                  {artFilter === 'pending' && <p className="text-stone-400 text-sm mt-1">শিল্পীরা শিল্পকর্ম আপলোড করলে এখানে দেখাবে</p>}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredArtworks.map(art => (
                    <div key={art.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-5 items-start hover:shadow-md transition-all">
                      <img src={art.image_url} alt={art.title} className="w-24 h-24 rounded-xl object-cover shrink-0 bg-stone-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-bold text-stone-900 text-base">{art.title}</h3>
                            <p className="text-stone-500 text-sm mt-0.5">{art.artist?.full_name} · {art.category}</p>
                            <p className="text-emerald-600 font-bold mt-1">৳{art.price?.toLocaleString()}</p>
                          </div>
                          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${art.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : art.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {art.status === 'approved' ? '✅ অনুমোদিত' : art.status === 'pending' ? '⏳ অপেক্ষমাণ' : '❌ বাতিল'}
                          </span>
                        </div>
                        {art.description && <p className="text-stone-400 text-xs mt-2 line-clamp-2">{art.description}</p>}
                        <p className="text-stone-400 text-xs mt-1">{art.created_at ? format(new Date(art.created_at), 'dd MMM yyyy') : ''}</p>
                      </div>
                      {art.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleArtworkStatus(art.id, 'approved', art.artist_id)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all">
                            <CheckCircle className="w-4 h-4" /> অনুমোদন
                          </button>
                          <button onClick={() => handleArtworkStatus(art.id, 'rejected', art.artist_id)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition-all">
                            <XCircle className="w-4 h-4" /> বাতিল
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── ARTISTS TAB ─── */}
          {activeTab === 'artists' && (
            <div>
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" placeholder="শিল্পী খুঁজুন..." value={searchArtist} onChange={e => setSearchArtist(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div className="grid gap-3">
                {filteredArtists.map(artist => (
                  <div key={artist.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
                    <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                      alt={artist.full_name} className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-stone-900">{artist.full_name}</h3>
                        {artist.is_verified
                          ? <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold"><ShieldCheck className="w-3 h-3" />Verified</span>
                          : <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold">Unverified</span>}
                      </div>
                      <p className="text-stone-400 text-sm">{artist.email} · {artist.district}</p>
                      <p className="text-stone-400 text-xs mt-1">{artist.total_sales} বিক্রয় · {format(new Date(artist.created_at || Date.now()), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleArtistVerify(artist.id, !artist.is_verified)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${artist.is_verified ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                        {artist.is_verified ? '❌ বাতিল করুন' : '✅ ভেরিফাই করুন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ORDERS TAB ─── */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 py-20 text-center">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">কোনো অর্ডার নেই</p>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                  <img src={order.artwork?.image_url} alt="" className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 text-sm">{order.artwork?.title}</h3>
                    <p className="text-stone-400 text-xs mt-0.5">{order.buyer_name} · {order.buyer_phone}</p>
                    <p className="text-stone-400 text-xs">{order.buyer_address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600">৳{order.artwork_price?.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700'
                      : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>{order.status}</span>
                    <p className="text-stone-400 text-[10px] mt-1">{order.created_at ? format(new Date(order.created_at), 'dd MMM yy') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── NID TAB ─── */}
          {activeTab === 'nid' && (
            <div>
              {pendingNid.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 py-20 text-center">
                  <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-medium">কোনো NID যাচাই অপেক্ষমাণ নেই</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingNid.map(artist => (
                    <div key={artist.id} className="bg-white rounded-2xl border border-stone-100 p-6">
                      <div className="flex items-start gap-5 flex-wrap">
                        <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                          alt={artist.full_name} className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-stone-900 text-lg">{artist.full_name}</h3>
                          <p className="text-stone-400 text-sm">{artist.email} · {artist.phone}</p>
                          <p className="text-stone-400 text-sm">{artist.district}</p>
                          {artist.nid_number && <p className="text-stone-600 text-sm mt-1 font-medium">NID: {artist.nid_number}</p>}
                          {artist.nid_name && <p className="text-stone-600 text-sm">NID নাম: {artist.nid_name}</p>}
                        </div>
                        {artist.nid_photo_url && (
                          <a href={artist.nid_photo_url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0">
                            <img src={artist.nid_photo_url} alt="NID" className="w-32 h-20 rounded-xl object-cover border border-stone-200 hover:opacity-80 transition-opacity cursor-pointer" />
                            <p className="text-xs text-stone-400 text-center mt-1">NID ফটো (বড় দেখুন)</p>
                          </a>
                        )}
                      </div>
                      <div className="flex gap-3 mt-5 pt-5 border-t border-stone-100">
                        <button onClick={() => handleNidVerify(artist.id, true)}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all">
                          <CheckCircle className="w-4 h-4" /> ভেরিফাই করুন
                        </button>
                        <button onClick={() => handleNidVerify(artist.id, false)}
                          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-all">
                          <XCircle className="w-4 h-4" /> বাতিল করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── MESSAGES TAB ─── */}
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {contactMessages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 py-20 text-center">
                  <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">কোনো বার্তা নেই</p>
                </div>
              ) : contactMessages.map(msg => (
                <div key={msg.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all ${msg.is_read ? 'border-stone-100' : 'border-emerald-200 bg-emerald-50/30'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {!msg.is_read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                        <h3 className="font-bold text-stone-900">{msg.name}</h3>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold">{msg.subject}</span>
                      </div>
                      <p className="text-stone-400 text-xs mb-2">{msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
                      <p className="text-stone-600 text-sm leading-relaxed">{msg.message}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-stone-400 text-xs">{msg.created_at ? new Date(msg.created_at).toLocaleDateString('bn-BD') : ''}</p>
                      {!msg.is_read && (
                        <button onClick={async () => {
                          await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
                          fetchAdminData();
                        }} className="mt-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all">
                          পঠিত চিহ্নিত করুন
                        </button>
                      )}
                      <a href={`mailto:${msg.email}`} className="mt-1 flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-200 transition-all">
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
    </div>
  );
}
