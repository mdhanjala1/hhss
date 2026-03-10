import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Facebook, Instagram, ShoppingBag, ArrowRight, Mail, Share2, Palette, Heart, AlertTriangle } from 'lucide-react';
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
  const { addToCart } = useCart();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" /></div>;
  if (!artist) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('প্রোফাইল লিংক কপি হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero — typography based, no banner image */}
      <div className="relative bg-stone-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(110,231,183,0.1) 0%, transparent 50%)"}} />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-9.5zm-2 4.5h-1v-1h1v1zm-1-4H7.5l2.5-6H16l2 6zm7.5-4H25v3h2.5v7H25v3h7.5V20.5h-5V16H27v4.5h-5V16H20v9h5v3h-2.5V25z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")"}} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} alt={artist.full_name} className="w-full h-full object-cover" />
              </div>
              {artist.is_verified && <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg"><ShieldCheck className="w-5 h-5" /></div>}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                {artist.is_verified ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" />যাচাইকৃত শিল্পী</span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold"><AlertTriangle className="w-3.5 h-3.5" />যাচাই বাকি</span>
                )}
                {artist.art_types?.map(t => <span key={t} className="px-2.5 py-1 bg-white/10 text-stone-300 rounded-full text-xs">{t}</span>)}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{artist.full_name}</h1>
              {artist.district && <p className="text-stone-400 flex items-center justify-center md:justify-start gap-1.5 mb-4"><MapPin className="w-4 h-4" />{artist.district}</p>}
              {artist.bio && <p className="text-stone-300 text-sm max-w-lg leading-relaxed">{artist.bio}</p>}
              <div className="flex items-center justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="text-center"><p className="text-2xl font-bold text-white">{artworks.length}</p><p className="text-stone-400 text-xs">শিল্পকর্ম</p></div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center"><p className="text-2xl font-bold text-white">{artist.total_sales}</p><p className="text-stone-400 text-xs">বিক্রয়</p></div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <p className="text-2xl font-bold text-white">{(artist.rating_avg || 0).toFixed(1)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              {artist.email && (
                <a href={`mailto:${artist.email}`} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all text-sm">
                  <Mail className="w-4 h-4" /> মেসেজ পাঠান
                </a>
              )}
              <button onClick={handleShare} className="p-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Social Links */}
        {(artist.facebook_url || artist.instagram_url) && (
          <div className="flex gap-3 mb-10">
            {artist.facebook_url && (
              <a href={artist.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {artist.instagram_url && (
              <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-600 border border-pink-200 rounded-2xl font-bold text-sm hover:bg-pink-100 transition-all">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
          </div>
        )}

        {/* Artworks */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900">শিল্পকর্মসমূহ <span className="text-stone-400 font-normal text-lg">({artworks.length})</span></h2>
          </div>

          {artworks.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-100">
              <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-500">এখনো কোনো শিল্পকর্ম নেই</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {artworks.map(art => (
                <div key={art.id} className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <Link to={`/artwork/${art.id}`} className="block relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button onClick={e => { e.preventDefault(); toggle(art); toast.success(isWishlisted(art.id) ? 'সরানো হয়েছে' : '❤️ যোগ হয়েছে'); }} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all ${isWishlisted(art.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-400 hover:text-red-500'}`}>
                      <Heart className={`w-4 h-4 ${isWishlisted(art.id) ? 'fill-current' : ''}`} />
                    </button>
                  </Link>
                  <div className="p-4">
                    <Link to={`/artwork/${art.id}`}><h3 className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3></Link>
                    {art.medium && <p className="text-stone-400 text-xs mt-0.5">{art.medium}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
                      <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all">
                        <ShoppingBag className="w-3.5 h-3.5" /> কার্টে যোগ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
