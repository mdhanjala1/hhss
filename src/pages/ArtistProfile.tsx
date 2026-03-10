import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Facebook, Instagram, ShoppingBag, ArrowRight, Mail, Share2, Palette, Heart, AlertTriangle, Phone } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  );
  if (!artist) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('লিংক কপি হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-stone-900 overflow-hidden" style={{ minHeight: '380px' }}>
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 15% 60%, rgba(16,185,129,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(110,231,183,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(5,150,105,0.1) 0%, transparent 60%)'
          }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">

            {/* Avatar */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                  alt={artist.full_name} className="w-full h-full object-cover" />
              </div>
              {artist.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {artist.is_verified
                  ? <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" />Verified শিল্পী</span>
                  : <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold"><AlertTriangle className="w-3.5 h-3.5" />যাচাই বাকি</span>
                }
                {artist.art_types?.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-white/10 text-stone-300 rounded-full text-xs border border-white/10">{t}</span>
                ))}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{artist.full_name}</h1>
              {artist.district && (
                <p className="text-stone-400 flex items-center gap-1.5 mb-3 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400" />{artist.district}, বাংলাদেশ
                </p>
              )}
              {artist.bio && <p className="text-stone-300 text-sm max-w-lg leading-relaxed">{artist.bio}</p>}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                {[
                  { label: 'শিল্পকর্ম', value: artworks.length },
                  { label: 'বিক্রয়', value: artist.total_sales || 0 },
                  { label: 'রেটিং', value: (artist.rating_avg || 0).toFixed(1), icon: <Star className="w-4 h-4 text-amber-400 fill-current" /> },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.icon}
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                      </div>
                      <p className="text-stone-400 text-xs mt-0.5">{s.label}</p>
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
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all">
                  <Mail className="w-4 h-4" /> মেসেজ পাঠান
                </a>
              )}
              <button onClick={handleShare} className="p-3 text-white rounded-2xl border border-white/20 hover:bg-white/10 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="font-bold text-stone-900 text-sm">যোগাযোগ ও সোশ্যাল</h3>
              {artist.phone && (
                <a href={`tel:${artist.phone}`} className="flex items-center gap-3 text-stone-600 hover:text-emerald-600 transition-colors text-sm">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  {artist.phone}
                </a>
              )}
              {artist.email && (
                <a href={`mailto:${artist.email}`} className="flex items-center gap-3 text-stone-600 hover:text-emerald-600 transition-colors text-sm">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="truncate">{artist.email}</span>
                </a>
              )}
              {artist.facebook_url && (
                <a href={artist.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-stone-600 hover:text-blue-600 transition-colors text-sm">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4 text-blue-600" />
                  </div>
                  Facebook
                </a>
              )}
              {artist.instagram_url && (
                <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-stone-600 hover:text-pink-600 transition-colors text-sm">
                  <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>
                  Instagram
                </a>
              )}
              {!artist.phone && !artist.email && !artist.facebook_url && !artist.instagram_url && (
                <p className="text-stone-400 text-sm">যোগাযোগের তথ্য নেই</p>
              )}
            </div>
          </aside>

          {/* Artworks grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900">
                শিল্পকর্মসমূহ
                <span className="text-stone-400 font-normal text-lg ml-2">({artworks.length})</span>
              </h2>
            </div>

            {artworks.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-stone-100">
                <Palette className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-400">এখনো কোনো শিল্পকর্ম নেই</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {artworks.map((art, i) => {
                  const inCart = isInCart(art.id);
                  const wishlisted = isWishlisted(art.id);
                  return (
                    <motion.div key={art.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                        <Link to={`/artwork/${art.id}`}>
                          <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </Link>
                        <button onClick={() => { toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ যোগ হয়েছে'); }}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-400'}`}>
                          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <div className="p-4">
                        <Link to={`/artwork/${art.id}`}>
                          <h3 className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3>
                        </Link>
                        {art.medium && <p className="text-stone-400 text-xs mt-0.5">{art.medium}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
                          <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${inCart ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {inCart ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
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
