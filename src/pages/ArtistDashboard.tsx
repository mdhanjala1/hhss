import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Plus, ShoppingBag, Settings, LogOut,
  CheckCircle, Clock, AlertCircle, Image as ImageIcon, DollarSign,
  Upload, X, Phone, MapPin, Palette, ShieldCheck, AlertTriangle,
  CreditCard, Eye, Bell, TrendingUp, Star, ExternalLink, Trash2,
  Package, BarChart3, Edit, Save, Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase, uploadToCloudinary } from '../lib/supabase';
import { Artist, Artwork, Order, Notification } from '../types';

const DISTRICTS = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','ময়মনসিংহ','রংপুর','কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টাঙ্গাইল','মানিকগঞ্জ','নরসিংদী','মুন্সীগঞ্জ','ফরিদপুর','গোপালগঞ্জ','মাদারীপুর','শরীয়তপুর','রাজবাড়ী','কিশোরগঞ্জ','নেত্রকোণা','জামালপুর','শেরপুর','ব্রাহ্মণবাড়িয়া','চাঁদপুর','ফেনী','লক্ষ্মীপুর','নোয়াখালী','খাগড়াছড়ি','রাঙ্গামাটি','বান্দরবান','কক্সবাজার','নাটোর','নওগাঁ','চাঁপাইনবাবগঞ্জ','বগুড়া','জয়পুরহাট','সিরাজগঞ্জ','পাবনা','কুষ্টিয়া','মেহেরপুর','চুয়াডাঙ্গা','ঝিনাইদহ','মাগুরা','নড়াইল','সাতক্ষীরা','বাগেরহাট','যশোর','পিরোজপুর','ঝালকাঠি','বরগুনা','পটুয়াখালী','ভোলা','হবিগঞ্জ','মৌলভীবাজার','সুনামগঞ্জ','কুড়িগ্রাম','গাইবান্ধা','নীলফামারী','লালমনিরহাট','ঠাকুরগাঁও','পঞ্চগড়','দিনাজপুর'];

type TabType = 'overview' | 'artworks' | 'orders' | 'upload' | 'verify' | 'settings' | 'notifications' | 'earnings';

export default function ArtistDashboard() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', size: '', medium: '', category: '', discount_percent: '' });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [newArt, setNewArt] = useState({ title: '', description: '', category: 'Painting', price: '', discount_percent: '', size: '', medium: '', colors: '', year_created: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [profileData, setProfileData] = useState({ full_name: '', bio: '', district: '', facebook_url: '', instagram_url: '', phone: '', whatsapp: '' });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [nidData, setNidData] = useState({ nid_number: '', nid_name: '' });
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const [submittingNid, setSubmittingNid] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    const { data: a } = await supabase.from('artists').select('*').eq('user_id', session.user.id).single();
    if (!a) { toast.error('প্রোফাইল পাওয়া যায়নি'); navigate('/login'); return; }
    setArtist(a);
    setProfileData({
      full_name: a.full_name || '', bio: a.bio || '', district: a.district || '',
      facebook_url: a.facebook_url || '', instagram_url: a.instagram_url || '',
      phone: a.phone || '', whatsapp: a.whatsapp || ''
    });
    const [{ data: aw }, { data: od }, { data: notif }] = await Promise.all([
      supabase.from('artworks').select('*').eq('artist_id', a.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, artwork:artworks(*)').eq('artist_id', a.id).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('artist_id', a.id).order('created_at', { ascending: false }).limit(50)
    ]);
    setArtworks(aw || []); setOrders(od || []); setNotifications(notif || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('একটি ছবি নির্বাচন করুন'); return; }
    if (!newArt.title || !newArt.price) { toast.error('শিরোনাম ও মূল্য দিন'); return; }
    if (!artist) return;
    setUploading(true);
    try {
      const { url, public_id, thumbnail } = await uploadToCloudinary(selectedFile, 'shilposhop_artworks');
      const payload: any = {
        artist_id: artist.id, title: newArt.title, description: newArt.description,
        category: newArt.category, price: parseFloat(newArt.price), medium: newArt.medium,
        colors: newArt.colors, image_url: url, image_public_id: public_id,
        thumbnail_url: thumbnail || url, status: 'pending'
      };
      if (newArt.size) payload.size_inches = newArt.size;
      if (newArt.year_created) payload.year_created = newArt.year_created;
      if (newArt.discount_percent) payload.discount_percent = parseFloat(newArt.discount_percent);
      const { error } = await supabase.from('artworks').insert(payload);
      if (error) throw error;
      toast.success('🎨 আপলোড সফল! অনুমোদনের পর প্রকাশিত হবে।');
      setActiveTab('artworks'); fetchData();
      setNewArt({ title: '', description: '', category: 'Painting', price: '', discount_percent: '', size: '', medium: '', colors: '', year_created: '' });
      setSelectedFile(null); setPreviewUrl(null);
    } catch (err: any) {
      toast.error('আপলোড ব্যর্থ: ' + (err.message || 'আবার চেষ্টা করুন'));
    } finally { setUploading(false); }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!artist) return;
    setSavingProfile(true);
    try {
      let imageUrl = artist.profile_image_url;
      if (profileFile) { const { url } = await uploadToCloudinary(profileFile, 'shilposhop_profiles'); imageUrl = url; }
      const { error } = await supabase.from('artists').update({ ...profileData, profile_image_url: imageUrl }).eq('id', artist.id);
      if (error) throw error;
      toast.success('✅ প্রোফাইল আপডেট হয়েছে!'); fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const handleNidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidFile || !nidData.nid_number || !artist) { toast.error('সব তথ্য দিন'); return; }
    setSubmittingNid(true);
    try {
      const { url } = await uploadToCloudinary(nidFile, 'shilposhop_nid_photo');
      const { error } = await supabase.from('artists').update({ nid_number: nidData.nid_number, nid_name: nidData.nid_name, nid_photo_url: url, verification_status: 'pending' }).eq('id', artist.id);
      if (error) throw error;
      toast.success('✅ যাচাইয়ের আবেদন জমা হয়েছে!'); fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmittingNid(false); }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    toast.success('স্ট্যাটাস আপডেট হয়েছে'); fetchData();
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!artist) return;
    await supabase.from('notifications').update({ is_read: true }).eq('artist_id', artist.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('সব নোটিফিকেশন পড়া হয়েছে');
  };

  const deleteArtwork = async (id: string) => {
    if (!confirm('এই শিল্পকর্মটি মুছবেন?')) return;
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('মুছে ফেলা হয়েছে'); fetchData();
  };

  const openEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setEditForm({ title: art.title, description: art.description || '', price: String(art.price), size: art.size_inches || '', medium: art.medium || '', category: art.category });
    setEditFile(null);
    setEditPreview(null);
  };

  const saveEdit = async () => {
    if (!editingArtwork) return;
    setEditSaving(true);
    try {
      let imageUrl = editingArtwork.image_url;
      if (editFile) {
        const { url } = await uploadToCloudinary(editFile, 'shilposhop_artworks');
        imageUrl = url;
      }
      const { error } = await supabase.from('artworks').update({
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        size_inches: editForm.size,
        medium: editForm.medium,
        category: editForm.category,
        image_url: imageUrl,
        status: 'pending', // re-submit for admin review
      }).eq('id', editingArtwork.id);
      if (error) throw error;
      toast.success('আপডেট হয়েছে! এডমিন পর্যালোচনার পর প্রকাশিত হবে।');
      setEditingArtwork(null);
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setEditSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c2a06e]" /></div>;

  const stats = {
    earnings: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.artwork_price || 0), 0),
    active: artworks.filter(a => a.status === 'approved').length,
    pending: orders.filter(o => o.status === 'new' || o.status === 'confirmed').length,
    review: artworks.filter(a => a.status === 'pending').length,
    totalOrders: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const isVerified = artist?.is_verified;
  const pendingNid = artist?.verification_status === 'pending';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const TABS: { id: TabType; label: string; icon: React.ReactNode; badge?: number; warn?: boolean }[] = [
    { id: 'overview', label: 'ওভারভিউ', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'artworks', label: 'শিল্পকর্ম', icon: <Palette className="w-4 h-4" />, badge: stats.review > 0 ? stats.review : undefined },
    { id: 'orders', label: 'অর্ডার', icon: <ShoppingBag className="w-4 h-4" />, badge: stats.pending > 0 ? stats.pending : undefined },
    { id: 'earnings', label: 'আয়', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'upload', label: 'আপলোড', icon: <Plus className="w-4 h-4" /> },
    { id: 'notifications', label: 'বিজ্ঞপ্তি', icon: <Bell className="w-4 h-4" />, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'verify', label: 'NID যাচাই', icon: <ShieldCheck className="w-4 h-4" />, warn: !isVerified },
    { id: 'settings', label: 'সেটিংস', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Top mobile nav */}
      <div className="lg:hidden border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }} px-4 py-3 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${activeTab === tab.id ? "text-white" style={{ background: activeTab === tab.id ? "linear-gradient(135deg,#c2a06e,#8b6914)" : "transparent" }} : 'text-[var(--text2)] hover:bg-[var(--bg)]'}`}>
              {tab.icon} {tab.label}
              {tab.badge && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 border-r" style={{ background: "var(--card)", borderColor: "var(--border)" }} min-h-screen flex-col fixed top-16 bottom-0">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <img src={artist?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist?.full_name}`} className="w-11 h-11 rounded-2xl object-cover border-2 border-[var(--border)]" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text)] text-sm truncate">{artist?.full_name}</p>
                <div className="flex items-center gap-1">
                  {isVerified ? <span className="text-[10px] text-[#c2a06e] font-bold flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" />যাচাইকৃত</span>
                    : <span className="text-[10px] text-amber-600 font-bold">যাচাই করুন</span>}
                </div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${activeTab === tab.id ? "text-[#8b6914]" style={{ background: activeTab === tab.id ? "rgba(194,160,110,0.12)" : "transparent" }} : 'text-[var(--text2)] hover:bg-[var(--bg)] hover:text-[var(--text)]'} ${tab.warn && !isVerified ? 'text-amber-600' : ''}`}>
                {tab.icon} {tab.label}
                {tab.badge && <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>}
                {tab.warn && !isVerified && <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-[var(--border)]">
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text2)] hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut className="w-4 h-4" /> লগআউট
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-6">
          {/* Verification alert */}
          {!isVerified && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${pendingNid ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
              {pendingNid ? <Clock className="w-5 h-5 text-blue-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              <div className="flex-1">
                <p className={`font-bold text-sm ${pendingNid ? 'text-blue-800' : 'text-amber-800'}`}>{pendingNid ? 'NID যাচাই পর্যালোচনায় আছে' : '⚠️ অ্যাকাউন্ট যাচাই হয়নি'}</p>
                <p className={`text-xs ${pendingNid ? 'text-blue-600' : 'text-amber-600'}`}>{pendingNid ? 'অ্যাডমিন শীঘ্রই দেখবেন (১-২ কার্যদিবস)' : 'NID দিয়ে যাচাই করুন — ক্রেতাদের আস্থা বাড়বে'}</p>
              </div>
              {!pendingNid && <button onClick={() => setActiveTab('verify')} className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all whitespace-nowrap">যাচাই করুন</button>}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-xl font-bold text-[var(--text)]">স্বাগতম, {artist?.full_name?.split(' ')[0]} 👋</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'মোট আয়', value: `৳${stats.earnings.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-50 text-[#c2a06e]' },
                    { label: 'সক্রিয় শিল্পকর্ম', value: stats.active, icon: <ImageIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                    { label: 'নতুন অর্ডার', value: stats.pending, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                    { label: 'সফল ডেলিভারি', value: stats.delivered, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl border border-[var(--border)] shadow-sm p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                      <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
                      <p className="text-[var(--text3)] text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Recent orders preview */}
                {orders.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                      <h3 className="font-bold text-[var(--text)]">সাম্প্রতিক অর্ডার</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-[#c2a06e] font-bold text-sm">সবগুলো দেখুন →</button>
                    </div>
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="px-5 py-4 flex items-center gap-4 border-b border-stone-50 last:border-0">
                        <div className="w-9 h-9 bg-[var(--bg)] rounded-xl text-[10px] font-bold text-[var(--text2)] flex items-center justify-center shrink-0">#{o.order_number?.slice(-4)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--text)] text-sm truncate">{o.artwork_title}</p>
                          <p className="text-[var(--text3)] text-xs">{o.customer_name} · {o.customer_district}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[var(--text)] text-sm">৳{o.artwork_price}</p>
                          <span className={`text-[10px] font-bold ${o.status === 'new' ? 'text-blue-600' : o.status === 'confirmed' ? 'text-amber-600' : o.status === 'delivered' ? 'text-[#c2a06e]' : 'text-red-500'}`}>
                            {o.status === 'new' ? 'নতুন' : o.status === 'confirmed' ? 'নিশ্চিত' : o.status === 'delivered' ? 'ডেলিভারড' : 'বাতিল'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('upload')} className="bg-emerald-600 text-white rounded-2xl p-5 text-left hover:bg-emerald-700 transition-all">
                    <Plus className="w-8 h-8 mb-2" />
                    <p className="font-bold">নতুন শিল্পকর্ম যোগ করুন</p>
                    <p className="text-emerald-200 text-xs mt-1">আপনার পরবর্তী মাস্টারপিস আপলোড করুন</p>
                  </button>
                  <Link to={`/artist/${artist?.id}`} className="bg-stone-900 text-white rounded-2xl p-5 text-left hover:bg-stone-800 transition-all">
                    <ExternalLink className="w-8 h-8 mb-2" />
                    <p className="font-bold">পাবলিক প্রোফাইল</p>
                    <p className="text-[var(--text3)] text-xs mt-1">ক্রেতারা যেভাবে আপনাকে দেখেন</p>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ARTWORKS */}
            {activeTab === 'artworks' && (
              <motion.div key="aw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="text-xl font-bold text-[var(--text)]">আমার শিল্পকর্ম ({artworks.length})</h1>
                  <button onClick={() => setActiveTab('upload')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> নতুন যোগ করুন
                  </button>
                </div>
                {artworks.length === 0 ? (
                  <div className="bg-white p-16 rounded-2xl border border-[var(--border)] text-center">
                    <Palette className="w-14 h-14 text-stone-200 mx-auto mb-3" />
                    <p className="text-[var(--text3)] mb-4">এখনো কোনো শিল্পকর্ম নেই</p>
                    <button onClick={() => setActiveTab('upload')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm">প্রথম শিল্পকর্ম আপলোড করুন</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artworks.map(art => (
                      <div key={art.id} className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden group">
                        <div className="aspect-[4/3] relative overflow-hidden bg-[var(--bg)]">
                          <img src={art.thumbnail_url || art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${art.status === 'approved' ? 'bg-emerald-500 text-white' : art.status === 'pending' ? 'bg-amber-400 text-white' : art.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-[var(--bg)]0 text-white'}`}>
                              {art.status === 'approved' ? '✓ অনুমোদিত' : art.status === 'pending' ? '⏳ পর্যালোচনায়' : art.status === 'rejected' ? '✗ বাতিল' : 'বিক্রিত'}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/artwork/${art.id}`} className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-stone-600 hover:text-emerald-600 transition-colors shadow-sm">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button onClick={() => openEdit(art)} className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-stone-600 hover:text-blue-600 transition-colors shadow-sm">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteArtwork(art.id)} className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-stone-600 hover:text-red-600 transition-colors shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-[var(--text)] text-sm truncate">{art.title}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[#c2a06e] font-bold">৳{art.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2 text-[var(--text3)] text-xs">
                              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{art.views_count}</span>
                              <span className="flex items-center gap-0.5"><ShoppingBag className="w-3 h-3" />{art.order_count}</span>
                            </div>
                          </div>
                          {art.admin_note && art.status === 'rejected' && (
                            <p className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{art.admin_note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <motion.div key="od" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <h1 className="text-xl font-bold text-[var(--text)] mb-5">অর্ডারসমূহ ({orders.length})</h1>
                {orders.length === 0 ? (
                  <div className="bg-white p-16 rounded-2xl border border-[var(--border)] text-center"><ShoppingBag className="w-14 h-14 text-stone-200 mx-auto mb-3" /><p className="text-[var(--text3)]">কোনো অর্ডার নেই</p></div>
                ) : orders.map(o => (
                  <div key={o.id} className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[var(--bg)] rounded-xl text-[10px] font-bold text-[var(--text2)] flex items-center justify-center">#{o.order_number?.slice(-4)}</div>
                        <div><p className="font-bold text-[var(--text)] text-sm">{o.customer_name}</p><p className="text-[var(--text3)] text-xs">{o.created_at ? format(new Date(o.created_at), 'dd MMM yyyy') : ''}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[var(--text)]">৳{o.artwork_price}</p>
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-2 py-1.5 text-xs font-bold outline-none cursor-pointer">
                          <option value="new">নতুন</option><option value="confirmed">নিশ্চিত</option><option value="delivered">ডেলিভারড</option><option value="cancelled">বাতিল</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-xs font-bold text-[var(--text3)] mb-1">পণ্য</p><p className="font-medium text-stone-800">{o.artwork_title}</p></div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text3)] mb-1">ঠিকানা</p>
                        <p className="text-stone-600 flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{o.customer_phone}</p>
                        <p className="text-stone-600 flex items-center gap-1 text-xs mt-1"><MapPin className="w-3 h-3" />{o.customer_address}, {o.customer_district}</p>
                      </div>
                      <div><p className="text-xs font-bold text-[var(--text3)] mb-1">নোট</p><p className="text-[var(--text2)] text-xs italic">{o.customer_note || 'কোনো নোট নেই'}</p></div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* EARNINGS */}
            {activeTab === 'earnings' && (
              <motion.div key="earn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-xl font-bold text-[var(--text)]">আয়ের বিবরণ</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'মোট আয়', value: `৳${stats.earnings.toLocaleString()}`, sub: `${stats.delivered} টি ডেলিভারি থেকে`, color: 'text-[#c2a06e]', bg: 'bg-emerald-50' },
                    { label: 'গড় অর্ডার মূল্য', value: stats.delivered > 0 ? `৳${Math.round(stats.earnings / stats.delivered).toLocaleString()}` : '৳০', sub: 'প্রতি ডেলিভারিতে', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'মোট অর্ডার', value: stats.totalOrders, sub: `${stats.pending} টি চলমান`, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((s, i) => (
                    <div key={i} className={`${s.bg} rounded-2xl p-6 border border-[var(--border)]`}>
                      <p className="text-[var(--text2)] text-sm font-medium">{s.label}</p>
                      <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
                      <p className="text-[var(--text3)] text-xs mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Order breakdown */}
                <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[var(--border)]">
                    <h3 className="font-bold text-[var(--text)]">অর্ডার বিশ্লেষণ</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { label: 'নতুন অর্ডার', count: orders.filter(o => o.status === 'new').length, color: 'bg-blue-500' },
                      { label: 'নিশ্চিত', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-amber-500' },
                      { label: 'ডেলিভারড', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-emerald-500' },
                      { label: 'বাতিল', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-stone-600 w-28 shrink-0">{item.label}</span>
                        <div className="flex-1 bg-[var(--bg)] rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0}%` }} />
                        </div>
                        <span className="text-sm font-bold text-[var(--text)] w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Delivered orders list */}
                <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[var(--border)]">
                    <h3 className="font-bold text-[var(--text)]">সফল ডেলিভারি</h3>
                  </div>
                  {orders.filter(o => o.status === 'delivered').length === 0 ? (
                    <div className="p-10 text-center text-[var(--text3)] text-sm">এখনো কোনো ডেলিভারি সম্পন্ন হয়নি</div>
                  ) : orders.filter(o => o.status === 'delivered').map(o => (
                    <div key={o.id} className="px-5 py-4 flex items-center gap-4 border-b border-stone-50 last:border-0">
                      <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--text)] text-sm truncate">{o.artwork_title}</p>
                        <p className="text-[var(--text3)] text-xs">{o.customer_name} · {o.created_at ? format(new Date(o.created_at), 'dd MMM yyyy') : ''}</p>
                      </div>
                      <p className="font-bold text-emerald-600 shrink-0">+৳{o.artwork_price}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* UPLOAD */}
            {activeTab === 'upload' && (
              <motion.div key="up" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
                <h1 className="text-xl font-bold text-[var(--text)] mb-5">নতুন শিল্পকর্ম আপলোড</h1>
                <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-bold text-stone-700 mb-2">ছবি নির্বাচন করুন *</p>
                      <div className={`aspect-[4/5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden cursor-pointer transition-all ${previewUrl ? 'border-emerald-400' : 'border-[var(--border)] hover:border-emerald-400 bg-[var(--bg)]'}`}>
                        {previewUrl ? (
                          <><img src={previewUrl} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-md text-red-500 z-10"><X className="w-4 h-4" /></button></>
                        ) : (
                          <><Upload className="w-10 h-10 text-stone-300" />
                            <div className="text-center px-4"><p className="font-bold text-stone-600 text-sm">ছবি নির্বাচন করুন</p><p className="text-xs text-[var(--text3)] mt-1">PNG, JPG (সর্বোচ্চ ৫MB)</p></div></>
                        )}
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">শিরোনাম *</label><input type="text" required placeholder="শিল্পকর্মের নাম" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.title} onChange={e => setNewArt({ ...newArt, title: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">ক্যাটাগরি *</label>
                          <select className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.category} onChange={e => setNewArt({ ...newArt, category: e.target.value })}>
                            <option value="Painting">পেইন্টিং</option>
                            <option value="Arabic Calligraphy">আরবি ক্যালিগ্রাফি</option>
                            <option value="Digital Art">ডিজিটাল আর্ট</option>
                            <option value="Handicraft">হস্তশিল্প</option>
                            <option value="Sculpture">ভাস্কর্য</option>
                            <option value="Photography">ফটোগ্রাফি</option>
                            <option value="Watercolor">জলরঙ</option>
                            <option value="Sketch">স্কেচ</option>
                          </select>
                        </div>
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">মূল্য (৳) *</label><input type="number" required placeholder="0" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.price} onChange={e => setNewArt({ ...newArt, price: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">ছাড় (%) <span className="font-normal text-[var(--text3)]">ঐচ্ছিক</span></label><input type="number" min="0" max="90" placeholder="০-৯০%" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.discount_percent} onChange={e => setNewArt({ ...newArt, discount_percent: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">সাইজ</label><input type="text" placeholder="১২x১৮ ইঞ্চি" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.size} onChange={e => setNewArt({ ...newArt, size: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">মাধ্যম</label><input type="text" placeholder="তেলরঙ, জলরঙ..." className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.medium} onChange={e => setNewArt({ ...newArt, medium: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">রঙ</label><input type="text" placeholder="লাল, নীল..." className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.colors} onChange={e => setNewArt({ ...newArt, colors: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-stone-600 mb-1">বছর</label><input type="text" placeholder="২০২৪" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={newArt.year_created} onChange={e => setNewArt({ ...newArt, year_created: e.target.value })} /></div>
                      </div>
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">বিবরণ</label><textarea rows={3} placeholder="শিল্পকর্মের গল্প বলুন..." className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm resize-none" value={newArt.description} onChange={e => setNewArt({ ...newArt, description: e.target.value })} /></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex justify-end gap-3">
                    <button type="button" onClick={() => setActiveTab('artworks')} className="px-5 py-2.5 text-[var(--text2)] font-bold hover:text-stone-700 text-sm">বাতিল</button>
                    <button onClick={handleUpload} disabled={uploading || !selectedFile} className="px-7 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm">
                      {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />আপলোড হচ্ছে...</> : <><CheckCircle className="w-4 h-4" />জমা দিন</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="text-xl font-bold text-[var(--text)]">বিজ্ঞপ্তি</h1>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-sm text-[#c2a06e] font-bold hover:text-emerald-700">সব পড়া হয়েছে চিহ্নিত করুন</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="bg-white p-16 rounded-2xl border border-[var(--border)] text-center">
                    <Bell className="w-14 h-14 text-stone-200 mx-auto mb-3" />
                    <p className="text-[var(--text3)]">কোনো বিজ্ঞপ্তি নেই</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} onClick={() => !n.is_read && markNotificationRead(n.id)}
                    className={`rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${n.is_read ? 'border-[var(--border)] opacity-70' : 'border-emerald-200 bg-emerald-50/30'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-[var(--bg)]' : 'bg-emerald-100'}`}>
                        <Bell className={`w-4 h-4 ${n.is_read ? 'text-[var(--text3)]' : 'text-[#c2a06e]'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[var(--text)] text-sm">{n.title}</p>
                        <p className="text-[var(--text2)] text-xs mt-0.5">{n.message}</p>
                        <p className="text-stone-300 text-xs mt-1">{format(new Date(n.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* NID VERIFY */}
            {activeTab === 'verify' && (
              <motion.div key="nid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-[var(--text)] mb-2">NID যাচাইকরণ</h1>
                <p className="text-[var(--text3)] text-sm mb-5">জাতীয় পরিচয়পত্র দিয়ে অ্যাকাউন্ট যাচাই করুন</p>
                {isVerified ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3"><ShieldCheck className="w-7 h-7 text-white" /></div>
                    <h3 className="text-lg font-bold text-emerald-800">যাচাইকৃত ✅</h3>
                    <p className="text-emerald-600 text-sm mt-1">আপনার প্রোফাইলে যাচাইকৃত ব্যাজ আছে।</p>
                  </div>
                ) : pendingNid ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><Clock className="w-7 h-7 text-blue-600" /></div>
                    <h3 className="text-lg font-bold text-blue-800">পর্যালোচনায় আছে</h3>
                    <p className="text-blue-600 text-sm mt-1">অ্যাডমিন শীঘ্রই যাচাই করবেন (১-২ কার্যদিবস)</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-amber-700 text-xs font-medium">যাচাইকৃত শিল্পীরা ক্রেতাদের বেশি আস্থা পান এবং বেশি বিক্রয় করতে পারেন।</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-sm font-bold text-stone-700 mb-2">NID কার্ডের সামনের ছবি *</p>
                        <div className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer transition-all ${nidPreview ? 'border-emerald-400' : 'border-[var(--border)] hover:border-emerald-400 bg-[var(--bg)]'}`}>
                          {nidPreview ? (
                            <><img src={nidPreview} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => { setNidFile(null); setNidPreview(null); }} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-red-500 z-10"><X className="w-3.5 h-3.5" /></button></>
                          ) : (
                            <><CreditCard className="w-10 h-10 text-stone-300" />
                              <div className="text-center"><p className="font-bold text-stone-600 text-sm">NID কার্ডের ছবি আপলোড করুন</p><p className="text-xs text-[var(--text3)]">সামনের অংশ স্পষ্ট হতে হবে</p></div></>
                          )}
                          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setNidFile(f); setNidPreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold text-stone-700 mb-1.5">NID নম্বর *</label><input type="text" placeholder="১৯ ডিজিটের NID" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={nidData.nid_number} onChange={e => setNidData({ ...nidData, nid_number: e.target.value })} /></div>
                        <div><label className="block text-sm font-bold text-stone-700 mb-1.5">NID তে নাম</label><input type="text" placeholder="NID কার্ডের নাম" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={nidData.nid_name} onChange={e => setNidData({ ...nidData, nid_name: e.target.value })} /></div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-[var(--bg)] rounded-xl">
                        <AlertCircle className="w-3.5 h-3.5 text-[var(--text3)] mt-0.5 shrink-0" />
                        <p className="text-xs text-[var(--text2)]">আপনার NID তথ্য শুধুমাত্র যাচাইয়ের জন্য ব্যবহার হবে এবং নিরাপদে সংরক্ষিত থাকবে।</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex justify-end">
                      <button onClick={handleNidSubmit} disabled={submittingNid || !nidFile || !nidData.nid_number} className="px-7 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
                        {submittingNid ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />জমা হচ্ছে...</> : <><ShieldCheck className="w-4 h-4" />যাচাইয়ের আবেদন করুন</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div key="st" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
                <h1 className="text-xl font-bold text-[var(--text)] mb-5">প্রোফাইল সেটিংস</h1>
                <div className="rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-bold text-stone-700 mb-2">প্রোফাইল ছবি</p>
                      <div className="w-36 h-36 rounded-3xl mx-auto relative overflow-hidden border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-emerald-400 transition-all">
                        <img src={profilePreview || artist?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist?.full_name}`} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="w-7 h-7 text-white" /></div>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setProfileFile(f); setProfilePreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <p className="text-center text-xs text-[var(--text3)] mt-2">ক্লিক করে পরিবর্তন করুন</p>
                    </div>
                    <div className="space-y-3">
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">পূর্ণ নাম *</label><input type="text" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">ফোন</label><input type="tel" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">WhatsApp</label><input type="tel" placeholder="WhatsApp নম্বর" className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.whatsapp} onChange={e => setProfileData({ ...profileData, whatsapp: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">জেলা *</label>
                        <select className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.district} onChange={e => setProfileData({ ...profileData, district: e.target.value })}>
                          <option value="">জেলা নির্বাচন করুন</option>
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-2">
                    <div><label className="block text-xs font-bold text-stone-600 mb-1">বায়ো</label><textarea rows={3} className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm resize-none" value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} placeholder="নিজের সম্পর্কে লিখুন..." /></div>
                  </div>
                  <div className="px-6 pb-5">
                    <p className="text-sm font-bold text-stone-700 mb-3">সোশ্যাল মিডিয়া লিংক</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">Facebook</label><input type="url" placeholder="https://facebook.com/..." className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.facebook_url} onChange={e => setProfileData({ ...profileData, facebook_url: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-stone-600 mb-1">Instagram</label><input type="url" placeholder="https://instagram.com/..." className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#c2a06e] outline-none text-sm" value={profileData.instagram_url} onChange={e => setProfileData({ ...profileData, instagram_url: e.target.value })} /></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex justify-end">
                    <button onClick={handleProfileUpdate} disabled={savingProfile} className="px-7 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
                      {savingProfile ? 'সংরক্ষণ হচ্ছে...' : <><CheckCircle className="w-4 h-4" />সংরক্ষণ করুন</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── EDIT ARTWORK MODAL ── */}
      <AnimatePresence>
        {editingArtwork && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditingArtwork(null); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text)]">শিল্পকর্ম এডিট করুন</h3>
                <button onClick={() => setEditingArtwork(null)} className="w-9 h-9 rounded-full bg-[var(--bg)] hover:bg-stone-200 flex items-center justify-center transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Image change */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2">ছবি পরিবর্তন (ঐচ্ছিক)</label>
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[var(--bg)] border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-emerald-400 transition-colors"
                    onClick={() => document.getElementById('editImageInput')?.click()}>
                    <img src={editPreview || editingArtwork.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-white text-center"><Camera className="w-8 h-8 mx-auto mb-1" /><p className="text-xs font-bold">ছবি পরিবর্তন করুন</p></div>
                    </div>
                  </div>
                  <input id="editImageInput" type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); }}} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">শিরোনাম *</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">বিবরণ</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3}
                    className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1.5">মূল্য (৳) *</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})}
                      className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1.5">মাধ্যম</label>
                    <input type="text" value={editForm.medium} onChange={e => setEditForm({...editForm, medium: e.target.value})} placeholder="তেলরঙ, জলরঙ..."
                      className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm" />
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700">
                  ⚠️ এডিট করার পর শিল্পকর্মটি পুনরায় এডমিনের পর্যালোচনায় যাবে এবং অনুমোদনের পর প্রকাশিত হবে।
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border)] flex gap-3">
                <button onClick={() => setEditingArtwork(null)} className="flex-1 py-3 bg-[var(--bg)] hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-sm transition-all">
                  বাতিল
                </button>
                <button onClick={saveEdit} disabled={editSaving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  {editSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />সংরক্ষণ করুন</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
