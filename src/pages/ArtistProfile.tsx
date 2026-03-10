import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Star, MapPin, Facebook, Instagram,
  ShoppingBag, Mail, Share2, Palette, Heart,
  AlertTriangle, Phone, Eye, Grid3x3, List,
  Award, TrendingUp, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Artist, Artwork } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => { fetchArtist(); }, [id]);

  const fetchArtist = async () => {
    setLoading(true);
    const { data: a } = await supabase.from('artists').select('*').eq('id', id).single();
    if (a) {
      setArtist(a);
      const { data: art } = await supabase.from('artworks').select('*').eq('artist_id', id).eq('status', 'approved').order('created_at', { ascending: false });
      setArtworks(art || []);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(194,160,110,0.2)' }} />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    </div>
  );
  if (!artist) return null;

  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); toast.success('লিংক কপি হয়েছে!'); };

  const stats = [
    { icon: <Palette className="w-5 h-5" />, value: artworks.length, label: 'শিল্পকর্ম' },
    { icon: <TrendingUp className="w-5 h-5" />, value: artist.total_sales || 0, label: 'বিক্রয়' },
    { icon: <Star className="w-5 h-5 fill-current" style={{ color: '#f59e0b' } as any} />, value: (artist.rating_avg || 0).toFixed(1), label: 'রেটিং' },
    { icon: <Award className="w-5 h-5" />, value: artist.is_verified ? 'Verified' : 'Pending', label: 'স্ট্যাটাস' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Deep dark background */}
        <div className="absolute inset-0" style={{ background: 'var(--dark)' }} />

        {/* Animated gradient blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--accent-dk) 0%, transparent 70%)' }} />

        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c2a06e' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23c2a06e' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />

        {/* Horizontal gold line accent */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-10">

            {/* ── Avatar with ring ── */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="relative shrink-0 self-center lg:self-end">
              {/* Outer glow ring */}
              <div className="absolute -inset-2 rounded-3xl opacity-40 blur-md"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))' }} />
              <div className="relative w-36 h-36 lg:w-48 lg:h-48 rounded-3xl overflow-hidden"
                style={{ border: '3px solid rgba(194,160,110,0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                  alt={artist.full_name} className="w-full h-full object-cover" />
              </div>
              {/* Verified badge */}
              {artist.is_verified && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified শিল্পী
                </motion.div>
              )}
            </motion.div>

            {/* ── Name + Info ── */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex-1 min-w-0 mt-4 lg:mt-0">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {!artist.is_verified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <AlertTriangle className="w-3 h-3" /> যাচাই বাকি
                  </span>
                )}
                {artist.art_types?.map((t: string) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(194,160,110,0.12)', color: 'rgba(194,160,110,0.9)', border: '1px solid rgba(194,160,110,0.2)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3"
                style={{ color: 'var(--bg)', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                {artist.full_name}
              </h1>

              {artist.district && (
                <p className="flex items-center gap-2 mb-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                  {artist.district}, বাংলাদেশ
                </p>
              )}
              {artist.bio && (
                <p className="text-sm leading-relaxed max-w-xl"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {artist.bio}
                </p>
              )}
            </motion.div>

            {/* ── Action Buttons ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="flex gap-3 flex-wrap shrink-0 self-center lg:self-end pb-2">
              {artist.email && (
                <a href={`mailto:${artist.email}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                  <Mail className="w-4 h-4" /> মেসেজ পাঠান
                </a>
              )}
              <button onClick={handleShare}
                className="p-3 rounded-2xl border transition-all hover:bg-white/10 hover:scale-105"
                style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(194,160,110,0.3)' }}>
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* ── Stats bar — sits ON the fold ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-t-3xl overflow-hidden"
            style={{ border: '1px solid rgba(194,160,110,0.2)', borderBottom: 'none', background: 'rgba(194,160,110,0.08)' }}>
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-5 px-4 text-center"
                style={{ background: i % 2 === 0 ? 'rgba(26,14,5,0.6)' : 'rgba(26,14,5,0.4)', backdropFilter: 'blur(8px)' }}>
                <div className="mb-1.5" style={{ color: 'var(--accent)' }}>{s.icon}</div>
                <p className="text-2xl font-bold" style={{ color: 'var(--bg)' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-5">

            {/* Contact Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {/* Card header */}
              <div className="px-5 py-4 border-b flex items-center gap-2"
                style={{ borderColor: 'var(--border)', background: 'rgba(194,160,110,0.05)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(194,160,110,0.15)', color: 'var(--accent)' }}>
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>যোগাযোগ</h3>
              </div>
              <div className="p-4 space-y-3">
                {artist.phone && (
                  <a href={`tel:${artist.phone}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(194,160,110,0.12)', color: 'var(--accent)' }}>
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">{artist.phone}</span>
                  </a>
                )}
                {artist.email && (
                  <a href={`mailto:${artist.email}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#3b82f6' }}>
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium truncate">{artist.email}</span>
                  </a>
                )}
                {artist.facebook_url && (
                  <a href={artist.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#3b82f6' }}>
                      <Facebook className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                )}
                {artist.instagram_url && (
                  <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                )}
                {!artist.phone && !artist.email && !artist.facebook_url && !artist.instagram_url && (
                  <p className="text-sm text-center py-2" style={{ color: 'var(--text3)' }}>তথ্য নেই</p>
                )}
              </div>
            </motion.div>

            {/* Art Types */}
            {artist.art_types && artist.art_types.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border p-4"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text)' }}>শিল্পের ধরন</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.art_types.map((t: string) => (
                    <span key={t} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick stats card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--dark), rgba(26,14,5,0.95))', borderColor: 'rgba(194,160,110,0.2)' }}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <h3 className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>শিল্পীর তথ্য</h3>
                </div>
                {[
                  { label: 'মোট শিল্পকর্ম', val: artworks.length },
                  { label: 'সফল বিক্রয়', val: artist.total_sales || 0 },
                  { label: 'গড় রেটিং', val: `⭐ ${(artist.rating_avg || 0).toFixed(1)}` },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-t"
                    style={{ borderColor: 'rgba(194,160,110,0.1)' }}>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>

          {/* ── Artworks Grid ── */}
          <div className="lg:col-span-3">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>শিল্পকর্মসমূহ</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>{artworks.length}টি প্রকাশিত শিল্পকর্ম</p>
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <button onClick={() => setView('grid')}
                  className="p-2 rounded-lg transition-all"
                  style={view === 'grid'
                    ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }
                    : { color: 'var(--text3)' }}>
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')}
                  className="p-2 rounded-lg transition-all"
                  style={view === 'list'
                    ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }
                    : { color: 'var(--text3)' }}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {artworks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-24 text-center rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(194,160,110,0.1)' }}>
                  <Palette className="w-10 h-10" style={{ color: 'var(--border)' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text3)' }}>কোনো শিল্পকর্ম নেই</h3>
                <p className="text-sm" style={{ color: 'var(--text3)' }}>এখনো কোনো শিল্পকর্ম প্রকাশিত হয়নি</p>
              </motion.div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <AnimatePresence>
                  {artworks.map((art, i) => {
                    const inCart = isInCart(art.id);
                    const wishlisted = isWishlisted(art.id);
                    return (
                      <motion.div key={art.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--bg)' }}>
                          <Link to={`/artwork/${art.id}`}>
                            <img src={art.image_url} alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </Link>
                          {/* Hover overlay */}
                          <Link to={`/artwork/${art.id}`}
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            style={{ background: 'rgba(26,14,5,0.5)' }}>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                              style={{ background: 'rgba(194,160,110,0.9)', color: 'var(--dark)' }}>
                              <Eye className="w-4 h-4" /> দেখুন
                            </span>
                          </Link>
                          {/* Wishlist */}
                          <button onClick={() => { toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ যোগ হয়েছে'); }}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all z-10"
                            style={wishlisted
                              ? { background: '#ef4444', color: '#fff' }
                              : { background: 'rgba(255,255,255,0.9)', color: 'rgba(0,0,0,0.4)' }}>
                            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                          </button>
                          {/* Image bottom line */}
                          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
                        </div>
                        <div className="p-3 relative">
                          {/* Dot pattern */}
                          <div className="absolute bottom-0 right-0 w-16 h-14 pointer-events-none overflow-hidden rounded-br-2xl"
                            style={{ backgroundImage: 'radial-gradient(rgba(194,160,110,0.35) 1.2px, transparent 1.2px)', backgroundSize: '5px 5px' }} />
                          <Link to={`/artwork/${art.id}`}>
                            <h3 className="font-bold text-sm line-clamp-1 hover:underline" style={{ color: 'var(--text)' }}>{art.title}</h3>
                          </Link>
                          {art.medium && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{art.medium}</p>}
                          <div className="flex items-center justify-between mt-2.5 gap-1">
                            <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>৳{art.price.toLocaleString()}</p>
                            <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all hover:opacity-90 shrink-0"
                              style={inCart
                                ? { background: 'rgba(194,160,110,0.1)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.25)' }
                                : { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                              <ShoppingBag className="w-3 h-3" />
                              {inCart ? '✓' : 'কার্ট'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* ── List view ── */
              <div className="space-y-3">
                {artworks.map((art, i) => {
                  const inCart = isInCart(art.id);
                  return (
                    <motion.div key={art.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex gap-4 p-4 rounded-2xl border transition-all hover:shadow-md"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <Link to={`/artwork/${art.id}`} className="shrink-0">
                        <img src={art.thumbnail_url || art.image_url} alt={art.title}
                          className="w-20 h-24 rounded-xl object-cover" style={{ background: 'var(--bg)' }} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/artwork/${art.id}`}>
                          <h3 className="font-bold text-base hover:underline" style={{ color: 'var(--text)' }}>{art.title}</h3>
                        </Link>
                        {art.medium && <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>{art.medium}</p>}
                        {art.size_inches && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{art.size_inches} ইঞ্চি</p>}
                        <div className="flex items-center gap-3 mt-3">
                          <p className="font-bold text-lg" style={{ color: 'var(--accent)' }}>৳{art.price.toLocaleString()}</p>
                          <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                            style={inCart
                              ? { background: 'rgba(194,160,110,0.1)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.3)' }
                              : { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {inCart ? '✓ কার্টে আছে' : 'কার্টে যোগ'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
