import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Facebook, Instagram, ShoppingBag, Mail, Share2, Palette, Heart, AlertTriangle, Phone, Eye } from 'lucide-react';
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );
  if (!artist) return null;

  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); toast.success('লিংক কপি হয়েছে!'); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--dark)', minHeight: '400px' }}>
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--accent)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--accent-dk)' }} />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c2a06e' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">

            {/* Avatar */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-2xl"
                style={{ border: '3px solid rgba(194,160,110,0.4)' }}>
                <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                  alt={artist.full_name} className="w-full h-full object-cover" />
              </div>
              {artist.is_verified && (
                <div className="absolute -bottom-3 -right-3 p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {artist.is_verified
                  ? <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(194,160,110,0.18)', color: 'var(--accent)', border: '1px solid rgba(194,160,110,0.3)' }}>
                      <ShieldCheck className="w-3 h-3" />যাচাইকৃত শিল্পী
                    </span>
                  : <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                      <AlertTriangle className="w-3 h-3" />যাচাই বাকি
                    </span>
                }
                {artist.art_types?.map((t: string) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: 'var(--bg)' }}>{artist.full_name}</h1>
              {artist.district && (
                <p className="flex items-center gap-1.5 mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />{artist.district}, বাংলাদেশ
                </p>
              )}
              {artist.bio && <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{artist.bio}</p>}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6" style={{ borderTop: '1px solid rgba(194,160,110,0.2)' }}>
                {[
                  { label: 'শিল্পকর্ম', value: artworks.length },
                  { label: 'বিক্রয়', value: artist.total_sales || 0 },
                  { label: 'রেটিং', value: (artist.rating_avg || 0).toFixed(1), icon: <Star className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} /> },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(194,160,110,0.2)' }} />}
                    <div>
                      <div className="flex items-center gap-1">
                        {s.icon}
                        <p className="text-2xl font-bold" style={{ color: 'var(--bg)' }}>{s.value}</p>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex gap-3 shrink-0 flex-wrap">
              {artist.email && (
                <a href={`mailto:${artist.email}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                  <Mail className="w-4 h-4" /> মেসেজ পাঠান
                </a>
              )}
              <button onClick={handleShare}
                className="p-3 rounded-2xl border transition-all hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border p-6 shadow-sm space-y-4 sticky top-24"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-sm pb-2 border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                যোগাযোগ ও সোশ্যাল
              </h3>
              {artist.phone && (
                <a href={`tel:${artist.phone}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--accent)' }}>
                    <Phone className="w-4 h-4" />
                  </div>{artist.phone}
                </a>
              )}
              {artist.email && (
                <a href={`mailto:${artist.email}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--accent)' }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{artist.email}</span>
                </a>
              )}
              {artist.facebook_url && (
                <a href={artist.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#3b82f6' }}>
                    <Facebook className="w-4 h-4" />
                  </div>Facebook
                </a>
              )}
              {artist.instagram_url && (
                <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(219,39,119,0.08)', color: '#ec4899' }}>
                    <Instagram className="w-4 h-4" />
                  </div>Instagram
                </a>
              )}
              {!artist.phone && !artist.email && !artist.facebook_url && !artist.instagram_url && (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>যোগাযোগের তথ্য নেই</p>
              )}
            </div>
          </aside>

          {/* Artworks Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                শিল্পকর্মসমূহ
                <span className="font-normal text-lg ml-2" style={{ color: 'var(--text3)' }}>({artworks.length})</span>
              </h2>
            </div>

            {artworks.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <Palette className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--border)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text3)' }}>এখনো কোনো শিল্পকর্ম নেই</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {artworks.map((art, i) => {
                  const inCart = isInCart(art.id);
                  const wishlisted = isWishlisted(art.id);
                  return (
                    <motion.div key={art.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

                      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--bg)' }}>
                        <Link to={`/artwork/${art.id}`}>
                          <img src={art.image_url} alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </Link>
                        {/* Wishlist */}
                        <button onClick={() => { toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ যোগ হয়েছে'); }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition-all z-10"
                          style={wishlisted
                            ? { background: '#ef4444', color: '#fff' }
                            : { background: 'rgba(255,255,255,0.9)', color: 'rgba(0,0,0,0.4)' }}>
                          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                        </button>
                        {/* View overlay */}
                        <Link to={`/artwork/${art.id}`}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: 'rgba(194,160,110,0.9)' }}>
                            <Eye className="w-4 h-4" /> বিস্তারিত
                          </span>
                        </Link>
                      </div>

                      <div className="p-3">
                        <Link to={`/artwork/${art.id}`}>
                          <h3 className="font-bold text-sm line-clamp-1 hover:underline" style={{ color: 'var(--text)' }}>
                            {art.title}
                          </h3>
                        </Link>
                        {art.medium && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{art.medium}</p>}
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <p className="font-bold" style={{ color: 'var(--text)' }}>৳{art.price.toLocaleString()}</p>
                          <button
                            onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0"
                            style={inCart
                              ? { background: 'rgba(194,160,110,0.1)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.25)' }
                              : { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                            <ShoppingBag className="w-3 h-3" />
                            {inCart ? 'যোগ' : 'কার্ট'}
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
