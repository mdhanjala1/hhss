import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Upload,
  X,
  ChevronRight,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Palette
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase, uploadToCloudinary } from '../lib/supabase';
import { Artist, Artwork, Order } from '../types';

export default function ArtistDashboard() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'artworks' | 'orders' | 'upload' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Form state for new artwork
  const [newArt, setNewArt] = useState({
    title: '',
    description: '',
    category: 'Painting',
    price: '',
    size: '',
    medium: '',
    colors: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Profile editing state
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    district: '',
    facebook_url: '',
    instagram_url: '',
    art_types: [] as string[]
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    // Fetch artist profile
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (artistError) {
      toast.error('Artist profile not found');
      navigate('/login');
      return;
    }

    setArtist(artistData);
    setProfileData({
      full_name: artistData.full_name,
      bio: artistData.bio || '',
      district: artistData.district,
      facebook_url: artistData.facebook_url || '',
      instagram_url: artistData.instagram_url || '',
      art_types: artistData.art_types || []
    });

    // Fetch artworks
    const { data: artworksData } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', artistData.id)
      .order('created_at', { ascending: false });

    setArtworks(artworksData || []);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, artwork:artworks(*)')
      .eq('artist_id', artistData.id)
      .order('created_at', { ascending: false });

    setOrders(ordersData || []);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !artist) return;

    setUploading(true);
    try {
      const { url, public_id, thumbnail } = await uploadToCloudinary(selectedFile, 'shilposhop_artworks');

      const { error } = await supabase
        .from('artworks')
        .insert({
          artist_id: artist.id,
          title: newArt.title,
          description: newArt.description,
          category: newArt.category,
          price: parseInt(newArt.price),
          size_inches: newArt.size,
          medium: newArt.medium,
          colors: newArt.colors,
          image_url: url,
          image_public_id: public_id,
          thumbnail_url: thumbnail,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Artwork uploaded! Waiting for admin approval.');
      setActiveTab('artworks');
      fetchData();
      setNewArt({ title: '', description: '', category: 'Painting', price: '', size: '', medium: '', colors: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // If delivered, update artist stats
      if (status === 'delivered') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await supabase.rpc('increment_artist_sales', { 
            artist_id_param: artist?.id, 
            amount_param: order.artwork_price 
          });
        }
      }

      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    setSavingProfile(true);
    try {
      let imageUrl = artist.profile_image_url;

      if (profileFile) {
        const { url } = await uploadToCloudinary(profileFile, 'shilposhop_profiles');
        imageUrl = url;
      }

      const { error } = await supabase
        .from('artists')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          district: profileData.district,
          facebook_url: profileData.facebook_url,
          instagram_url: profileData.instagram_url,
          art_types: profileData.art_types,
          profile_image_url: imageUrl
        })
        .eq('id', artist.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      fetchData();
      setProfileFile(null);
      setProfilePreview(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const stats = {
    totalEarnings: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.artwork_price, 0),
    activeArt: artworks.filter(a => a.status === 'approved').length,
    pendingOrders: orders.filter(o => o.status === 'new' || o.status === 'confirmed').length,
    pendingArt: artworks.filter(a => a.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-100 hidden lg:flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 truncate">{artist?.full_name}</h2>
              <p className="text-xs text-stone-500">আর্টিস্ট স্টুডিও</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            ওভারভিউ
          </button>
          <button 
            onClick={() => setActiveTab('artworks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'artworks' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <ImageIcon className="w-5 h-5" />
            আমার শিল্পকর্ম
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            অর্ডারসমূহ
            {stats.pendingOrders > 0 && (
              <span className="ml-auto bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {stats.pendingOrders}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <Plus className="w-5 h-5" />
            নতুন আপলোড
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <Settings className="w-5 h-5" />
            সেটিংস
          </button>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 capitalize">
              {activeTab === 'overview' ? 'ওভারভিউ' : 
               activeTab === 'artworks' ? 'আমার শিল্পকর্ম' : 
               activeTab === 'orders' ? 'অর্ডারসমূহ' : 
               activeTab === 'upload' ? 'নতুন আপলোড' : 'সেটিংস'}
            </h1>
            <p className="text-stone-500">আপনার সৃজনশীল ব্যবসা পরিচালনা করুন</p>
          </div>
          <button 
            onClick={() => setActiveTab('upload')}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-stone-800 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
          >
            <Plus className="w-5 h-5" />
            নতুন শিল্পকর্ম
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-stone-500 text-sm font-medium">মোট আয়</p>
                  <h3 className="text-2xl font-bold text-stone-900 mt-1">৳{stats.totalEarnings.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-stone-500 text-sm font-medium">সক্রিয় শিল্পকর্ম</p>
                  <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.activeArt}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-stone-500 text-sm font-medium">অপেক্ষমান অর্ডার</p>
                  <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.pendingOrders}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-stone-500 text-sm font-medium">পর্যালোচনায় আছে</p>
                  <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.pendingArt}</h3>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                  <h3 className="font-bold text-stone-900">সাম্প্রতিক অর্ডারসমূহ</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-emerald-600 text-sm font-bold hover:underline">সবগুলো দেখুন</button>
                </div>
                <div className="divide-y divide-stone-50">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-6 flex items-center gap-4">
                      <img src={order.artwork?.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-900">{order.artwork_title}</h4>
                        <p className="text-stone-500 text-sm">ক্রেতা: {order.customer_name} • {format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-900">৳{order.artwork_price}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status === 'new' ? 'নতুন' : 
                           order.status === 'confirmed' ? 'নিশ্চিত' : 
                           order.status === 'delivered' ? 'ডেলিভারড' : 'বাতিল'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="p-12 text-center text-stone-400">এখনো কোনো অর্ডার নেই</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'artworks' && (
            <motion.div 
              key="artworks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {artworks.map(art => (
                <div key={art.id} className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden group">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg ${
                        art.status === 'approved' ? 'bg-emerald-500 text-white' :
                        art.status === 'pending' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {art.status === 'approved' ? 'অনুমোদিত' : 
                         art.status === 'pending' ? 'অপেক্ষমান' : 'বাতিল'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-stone-900 text-lg mb-1">{art.title}</h3>
                    <p className="text-stone-500 text-sm mb-4">{art.category} • ৳{art.price}</p>
                    <div className="flex items-center gap-4 text-stone-400 text-xs">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {art.order_count} টি বিক্রয়</span>
                      <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {art.views_count} বার দেখা হয়েছে</span>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setActiveTab('upload')}
                className="aspect-[4/5] border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-stone-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white/50"
              >
                <Plus className="w-12 h-12" />
                <span className="font-bold">নতুন শিল্পকর্ম আপলোড করুন</span>
              </button>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center font-bold text-stone-500">
                        #{order.order_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900">অর্ডার করেছেন: {order.customer_name}</h3>
                        <p className="text-stone-500 text-sm">{format(new Date(order.created_at), 'MMMM d, yyyy • h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="new">নতুন</option>
                        <option value="confirmed">নিশ্চিত</option>
                        <option value="delivered">ডেলিভারড</option>
                        <option value="cancelled">বাতিল</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-1 flex gap-4">
                      <img src={order.artwork?.thumbnail_url} alt="" className="w-24 h-32 rounded-2xl object-cover shadow-md" />
                      <div>
                        <h4 className="font-bold text-stone-900">{order.artwork_title}</h4>
                        <p className="text-stone-500 text-sm mb-2">মূল্য: ৳{order.artwork_price}</p>
                        <p className="text-xs text-stone-400">পেমেন্ট: {order.payment_method === 'cash_on_delivery' ? 'ক্যাশ অন ডেলিভারি' : order.payment_method}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-1 space-y-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">ক্রেতার বিবরণ</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <User className="w-4 h-4 text-stone-400 mt-0.5" />
                          <span className="text-stone-700 font-medium">{order.customer_name}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <Phone className="w-4 h-4 text-stone-400 mt-0.5" />
                          <span className="text-stone-700 font-medium">{order.customer_phone}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                          <span className="text-stone-700 font-medium">{order.customer_address}, {order.customer_district}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 space-y-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">ক্রেতার নোট</h4>
                      <div className="bg-stone-50 p-4 rounded-2xl text-sm text-stone-600 italic">
                        {order.customer_note || "কোনো বিশেষ নির্দেশনা দেওয়া হয়নি।"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="bg-white p-20 rounded-3xl border border-stone-100 text-center">
                  <ShoppingBag className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-900">এখনো কোনো অর্ডার নেই</h3>
                  <p className="text-stone-500">আপনার শিল্পকর্মগুলো তাদের প্রথম ক্রেতার অপেক্ষায় আছে!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleUpload} className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Image Upload Area */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-stone-700 mb-2">শিল্পকর্মের ছবি</label>
                    <div 
                      className={`aspect-[4/5] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden ${previewUrl ? 'border-emerald-500' : 'border-stone-200 hover:border-emerald-500 bg-stone-50'}`}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-500 hover:scale-110 transition-transform"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                            <Upload className="w-8 h-8 text-stone-400" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-stone-900">আপলোড করতে ক্লিক করুন</p>
                            <p className="text-xs text-stone-500 mt-1">PNG, JPG অথবা JPEG (সর্বোচ্চ ৫ মেগাবাইট)</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">শিরোনাম</label>
                      <input 
                        type="text" 
                        required
                        placeholder="যেমন: পদ্মার পাড়ে জোছনা"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={newArt.title}
                        onChange={(e) => setNewArt({...newArt, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">ক্যাটাগরি</label>
                        <select 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.category}
                          onChange={(e) => setNewArt({...newArt, category: e.target.value})}
                        >
                          <option value="Painting">পেইন্টিং</option>
                          <option value="Handicraft">হস্তশিল্প</option>
                          <option value="Sculpture">ভাস্কর্য</option>
                          <option value="Digital Art">ডিজিটাল আর্ট</option>
                          <option value="Photography">ফটোগ্রাফি</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">মূল্য (৳)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.price}
                          onChange={(e) => setNewArt({...newArt, price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">সাইজ (ইঞ্চি)</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: ১২x১৮"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.size}
                          onChange={(e) => setNewArt({...newArt, size: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">মাধ্যম</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: ক্যানভাসে তেলরঙ"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.medium}
                          onChange={(e) => setNewArt({...newArt, medium: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">রঙ (Colors)</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: লাল, নীল, সোনালী"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.colors}
                          onChange={(e) => setNewArt({...newArt, colors: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">তৈরির বছর</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: ২০২৪"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={newArt.year_created || ''}
                          onChange={(e) => setNewArt({...newArt, year_created: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">বিবরণ</label>
                      <textarea 
                        rows={4}
                        placeholder="এই শিল্পকর্মের পেছনের গল্পটি বলুন..."
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                        value={newArt.description}
                        onChange={(e) => setNewArt({...newArt, description: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('artworks')}
                    className="px-8 py-3 text-stone-500 font-bold hover:text-stone-700 transition-all"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        আপলোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        শিল্পকর্ম প্রকাশ করুন
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleProfileUpdate} className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profile Image Area */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-stone-700 mb-2">প্রোফাইল ছবি</label>
                    <div 
                      className="aspect-square w-48 mx-auto rounded-full border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden bg-stone-50"
                    >
                      {(profilePreview || artist?.profile_image_url) ? (
                        <>
                          <img src={profilePreview || artist?.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <Upload className="w-8 h-8 text-stone-400" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfileFile(file);
                            setProfilePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-center text-xs text-stone-500">প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন</p>
                  </div>

                  {/* Details Area */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">পূর্ণ নাম</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">জেলা</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={profileData.district}
                        onChange={(e) => setProfileData({...profileData, district: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">বায়ো</label>
                      <textarea 
                        rows={4}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">ফেসবুক লিংক</label>
                        <input 
                          type="url" 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={profileData.facebook_url}
                          onChange={(e) => setProfileData({...profileData, facebook_url: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">ইনস্টাগ্রাম লিংক</label>
                        <input 
                          type="url" 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={profileData.instagram_url}
                          onChange={(e) => setProfileData({...profileData, instagram_url: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-4">
                  <button 
                    type="submit"
                    disabled={savingProfile}
                    className="px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনগুলো সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
