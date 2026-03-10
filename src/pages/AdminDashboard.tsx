import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  ImageIcon, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  Eye,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Artist, Artwork, Order } from '../types';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'artworks' | 'artists' | 'orders' | 'nid'>('stats');
  const [pendingNid, setPendingNid] = useState<Artist[]>([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalArtworks: 0,
    pendingArtworks: 0,
    totalOrders: 0,
    totalSales: 0,
    deliveredOrders: 0
  });
  
  const [pendingArt, setPendingArt] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    fetchAdminData();
  }, []);

  const checkAdmin = async () => {
    // Wait a moment for auth to initialize
    await new Promise(r => setTimeout(r, 300));
    const { data: { session } } = await supabase.auth.getSession();
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com').trim().toLowerCase();
    if (!session) { navigate('/login'); return; }
    const userEmail = (session.user.email || '').trim().toLowerCase();
    if (userEmail !== adminEmail) {
      toast.error(`Access denied. (${userEmail})`);
      navigate('/');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Stats
      const { count: artistCount } = await supabase.from('artists').select('*', { count: 'exact', head: true });
      const { count: artworkCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { data: ordersData } = await supabase.from('orders').select('*');
      
      const totalSales = ordersData?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.artwork_price, 0) || 0;
      const deliveredCount = ordersData?.filter(o => o.status === 'delivered').length || 0;

      setStats({
        totalArtists: artistCount || 0,
        totalArtworks: artworkCount || 0,
        pendingArtworks: pendingCount || 0,
        totalOrders: ordersData?.length || 0,
        totalSales,
        deliveredOrders: deliveredCount
      });

      // Fetch Pending Artworks
      const { data: pendingData } = await supabase
        .from('artworks')
        .select('*, artist:artists(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setPendingArt(pendingData || []);

      // Fetch Artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });
      setArtists(artistsData || []);

      // Fetch Orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*, artwork:artworks(*), artist:artists(*)')
        .order('created_at', { ascending: false });
      setOrders(allOrders || []);

      // Fetch pending NID verifications
      const { data: nidData } = await supabase.from('artists').select('*').eq('verification_status', 'pending').order('created_at', { ascending: false });
      setPendingNid(nidData || []);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNidVerify = async (artistId: string, approve: boolean) => {
    const { error } = await supabase.from('artists').update({
      is_verified: approve,
      verification_status: approve ? 'verified' : 'rejected'
    }).eq('id', artistId);
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? '✅ শিল্পী যাচাই হয়েছে!' : '❌ যাচাই বাতিল করা হয়েছে');
    fetchAdminData();
  };

  const handleArtworkStatus = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({ 
          status, 
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          admin_note: note
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Artwork ${status} successfully`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showNidModal, setShowNidModal] = useState(false);

  const handleArtistVerify = async (id: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from('artists')
        .update({ is_verified: verify })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Artist ${verify ? 'verified' : 'unverified'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-stone-900 text-stone-400 hidden lg:flex flex-col">
        <div className="p-8 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">এডমিন প্যানেল</h2>
              <p className="text-xs text-stone-500">শিল্পশপ নিয়ন্ত্রণ</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-stone-800'}`}
          >
            <BarChart3 className="w-5 h-5" />
            ড্যাশবোর্ড পরিসংখ্যান
          </button>
          <button 
            onClick={() => setActiveTab('artworks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'artworks' ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-stone-800'}`}
          >
            <ImageIcon className="w-5 h-5" />
            শিল্পকর্ম রিভিউ
            {stats.pendingArtworks > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {stats.pendingArtworks}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('artists')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'artists' ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-stone-800'}`}
          >
            <Users className="w-5 h-5" />
            শিল্পী ব্যবস্থাপনা
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-stone-800'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            সকল অর্ডার
          </button>
          <button 
            onClick={() => setActiveTab('nid')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'nid' ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-stone-800'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            NID যাচাই
            {pendingNid.length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingNid.length}</span>}
          </button>
        </nav>

        <div className="p-6 border-t border-stone-800">
          <div className="bg-stone-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-stone-500 uppercase mb-2">লগইন করা আছে</p>
            <p className="text-sm text-white truncate">{import.meta.env.VITE_ADMIN_EMAIL}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900">
              {activeTab === 'stats' && 'পারফরম্যান্স ওভারভিউ'}
              {activeTab === 'artworks' && 'শিল্পকর্ম অনুমোদন'}
              {activeTab === 'artists' && 'শিল্পী ডিরেক্টরি'}
              {activeTab === 'orders' && 'অর্ডার ব্যবস্থাপনা'}
            </h1>
            <p className="text-stone-500 mt-1">রিয়েল-টাইম প্ল্যাটফর্ম মনিটরিং এবং নিয়ন্ত্রণ</p>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchAdminData} className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all shadow-sm">
              <TrendingUp className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-stone-500 font-medium">মোট প্ল্যাটফর্ম বিক্রয়</p>
                  <h3 className="text-4xl font-bold text-stone-900 mt-2">৳{stats.totalSales.toLocaleString()}</h3>
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stats.deliveredOrders} টি সফল ডেলিভারি</span>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-stone-500 font-medium">মোট শিল্পকর্ম</p>
                  <h3 className="text-4xl font-bold text-stone-900 mt-2">{stats.totalArtworks}</h3>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-bold">
                    <Clock className="w-4 h-4" />
                    <span>{stats.pendingArtworks} টি অনুমোদনের অপেক্ষায়</span>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-stone-500 font-medium">নিবন্ধিত শিল্পী</p>
                  <h3 className="text-4xl font-bold text-stone-900 mt-2">{stats.totalArtists}</h3>
                  <div className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{artists.filter(a => a.is_verified).length} জন ভেরিফাইড শিল্পী</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Mini Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
                  <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-stone-900 text-xl">সাম্প্রতিক অর্ডার</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-emerald-600 font-bold text-sm">সবগুলো দেখুন</button>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="p-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-bold text-stone-500">
                          #{order.order_number.split('-')[1]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-stone-900">{order.artwork_title}</p>
                          <p className="text-xs text-stone-500">ক্রেতা: {order.customer_name} • {format(new Date(order.created_at), 'MMM d')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900">৳{order.artwork_price}</p>
                          <p className={`text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'text-emerald-600' : 'text-orange-500'}`}>{order.status === 'delivered' ? 'ডেলিভারড' : 'পেন্ডিং'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
                  <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-stone-900 text-xl">নতুন শিল্পী</h3>
                    <button onClick={() => setActiveTab('artists')} className="text-emerald-600 font-bold text-sm">ব্যবস্থাপনা</button>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {artists.slice(0, 5).map(artist => (
                      <div key={artist.id} className="p-6 flex items-center gap-4">
                        <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-bold text-stone-900">{artist.full_name}</p>
                          <p className="text-xs text-stone-500">{artist.district} • {format(new Date(artist.created_at), 'MMM d')}</p>
                        </div>
                        {artist.is_verified ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-stone-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'artworks' && (
            <motion.div 
              key="artworks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {pendingArt.map(art => (
                <div key={art.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-72 aspect-[4/5] md:aspect-auto">
                    <img src={art.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900">{art.title}</h3>
                        <p className="text-stone-500">শিল্পী: <span className="font-bold text-stone-700">{art.artist?.full_name}</span> • {art.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">৳{art.price}</p>
                        <p className="text-xs text-stone-400">{art.size_inches} • {art.medium}</p>
                      </div>
                    </div>
                    
                    <p className="text-stone-600 mb-8 flex-1 leading-relaxed">
                      {art.description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-6 border-t border-stone-50">
                      <button 
                        onClick={() => handleArtworkStatus(art.id, 'approved')}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        শিল্পকর্ম অনুমোদন করুন
                      </button>
                      <button 
                        onClick={() => {
                          const note = prompt('প্রত্যাখ্যানের কারণ লিখুন:');
                          if (note) handleArtworkStatus(art.id, 'rejected', note);
                        }}
                        className="flex-1 bg-white border border-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        প্রত্যাখ্যান করুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingArt.length === 0 && (
                <div className="bg-white p-20 rounded-[2rem] border border-stone-100 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-900">All caught up!</h3>
                  <p className="text-stone-500">No artworks waiting for approval.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'artists' && (
            <motion.div 
              key="artists"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">শিল্পী</th>
                      <th className="px-8 py-4">যোগাযোগ</th>
                      <th className="px-8 py-4">অবস্থান</th>
                      <th className="px-8 py-4">পরিসংখ্যান</th>
                      <th className="px-8 py-4">স্ট্যাটাস</th>
                      <th className="px-8 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {artists.map(artist => (
                      <tr key={artist.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                            <div>
                              <p className="font-bold text-stone-900">{artist.full_name}</p>
                              <p className="text-xs text-stone-400">যোগদান: {format(new Date(artist.created_at), 'MMM yyyy')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-stone-700">{artist.email}</p>
                          <p className="text-xs text-stone-400">{artist.phone}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-stone-700">{artist.district}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-stone-900">৳{artist.total_earnings.toLocaleString()}</p>
                          <p className="text-xs text-stone-400">{artist.total_sales} টি বিক্রয়</p>
                        </td>
                        <td className="px-8 py-6">
                          {artist.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                              <ShieldCheck className="w-3 h-3" /> ভেরিফাইড
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase">
                              আনভেরিফাইড
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedArtist(artist);
                              setShowNidModal(true);
                            }}
                            className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
                            title="View NID"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleArtistVerify(artist.id, !artist.is_verified)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${artist.is_verified ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            {artist.is_verified ? 'বাতিল করুন' : 'ভেরিফাই করুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">অর্ডার নং</th>
                      <th className="px-8 py-4">শিল্পকর্ম</th>
                      <th className="px-8 py-4">শিল্পী</th>
                      <th className="px-8 py-4">ক্রেতা</th>
                      <th className="px-8 py-4">পরিমাণ</th>
                      <th className="px-8 py-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-stone-900">{order.order_number}</p>
                          <p className="text-[10px] text-stone-400">{format(new Date(order.created_at), 'MMM d, h:mm a')}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={order.artwork?.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <p className="text-sm font-medium text-stone-700 truncate max-w-[150px]">{order.artwork_title}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-stone-600">{order.artist?.full_name}</td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-medium text-stone-700">{order.customer_name}</p>
                          <p className="text-xs text-stone-400">{order.customer_phone}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-stone-900">৳{order.artwork_price.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status === 'delivered' ? 'ডেলিভারড' : order.status === 'cancelled' ? 'বাতিল' : 'পেন্ডিং'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'nid' && (
            <motion.div key="nid" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-stone-900">NID যাচাইয়ের আবেদন</h2>
              {pendingNid.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 p-16 text-center">
                  <ShieldCheck className="w-14 h-14 text-emerald-200 mx-auto mb-3" />
                  <p className="text-stone-400">কোনো পেন্ডিং যাচাই নেই</p>
                </div>
              ) : pendingNid.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-wrap items-center gap-4">
                    <img src={a.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-900">{a.full_name}</h3>
                      <p className="text-stone-400 text-sm">{a.district} • {a.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleNidVerify(a.id, true)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> অনুমোদন
                      </button>
                      <button onClick={() => handleNidVerify(a.id, false)} className="px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> বাতিল
                      </button>
                    </div>
                  </div>
                  {(a.nid_photo_url || a.nid_number) && (
                    <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {a.nid_photo_url && (
                        <div>
                          <p className="text-xs font-bold text-stone-400 mb-2">NID কার্ডের ছবি</p>
                          <img src={a.nid_photo_url} alt="NID" className="w-full max-w-xs rounded-xl border border-stone-200 object-cover" />
                        </div>
                      )}
                      <div className="space-y-3">
                        {a.nid_number && <div><p className="text-xs font-bold text-stone-400">NID নম্বর</p><p className="font-mono font-bold text-stone-900">{a.nid_number}</p></div>}
                        {a.nid_name && <div><p className="text-xs font-bold text-stone-400">NID তে নাম</p><p className="font-bold text-stone-900">{a.nid_name}</p></div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNidModal && selectedArtist && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNidModal(false)}
                className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden"
              >
                <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900">NID ভেরিফিকেশন: {selectedArtist.full_name}</h3>
                    <p className="text-stone-500">শিল্পীর পরিচয়পত্র যাচাই করুন</p>
                  </div>
                  <button 
                    onClick={() => setShowNidModal(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-8 h-8 text-stone-300 hover:text-stone-600" />
                  </button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    <p className="font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      NID সম্মুখ অংশ
                    </p>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                      {selectedArtist.nid_front_url ? (
                        <img 
                          src={selectedArtist.nid_front_url} 
                          alt="NID Front" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <AlertCircle className="w-12 h-12 mb-2" />
                          <p>কোনো ছবি আপলোড করা হয়নি</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      NID পিছনের অংশ
                    </p>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                      {selectedArtist.nid_back_url ? (
                        <img 
                          src={selectedArtist.nid_back_url} 
                          alt="NID Back" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <AlertCircle className="w-12 h-12 mb-2" />
                          <p>কোনো ছবি আপলোড করা হয়নি</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-stone-50 flex justify-end gap-4">
                  <button 
                    onClick={() => setShowNidModal(false)}
                    className="px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-100 transition-all"
                  >
                    বন্ধ করুন
                  </button>
                  {!selectedArtist.is_verified && (
                    <button 
                      onClick={() => {
                        handleArtistVerify(selectedArtist.id, true);
                        setShowNidModal(false);
                      }}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                    >
                      ভেরিফিকেশন সম্পন্ন করুন
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
