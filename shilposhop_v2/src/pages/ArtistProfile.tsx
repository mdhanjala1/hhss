import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Palette, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Facebook, 
  Instagram, 
  Globe,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Mail,
  Phone,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artist, Artwork } from '../types';

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtist();
  }, [id]);

  const fetchArtist = async () => {
    setLoading(true);
    const { data: artistData } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (artistData) {
      setArtist(artistData);
      const { data: artworksData } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      setArtworks(artworksData || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2000" 
            alt="Banner" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
          {/* Left Column: Profile Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-80 shrink-0"
          >
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-stone-200/50 border border-stone-100 text-center">
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto">
                  <img 
                    src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} 
                    alt={artist.full_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {artist.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">{artist.full_name}</h1>
              <p className="text-stone-500 font-medium mb-6 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> {artist.district}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-50 p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-stone-900">{artist.total_sales}</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">বিক্রয়</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-stone-900">{artist.rating_avg}</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">রেটিং</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" /> মেসেজ পাঠান
                </button>
                <div className="flex gap-2">
                  {artist.facebook_url && (
                    <a href={artist.facebook_url} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {artist.instagram_url && (
                    <a href={artist.instagram_url} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-400 hover:text-pink-600 hover:bg-pink-50 transition-all flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  <button className="flex-1 py-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-stone-200/30 border border-stone-100 mt-8 space-y-6">
              <h3 className="font-bold text-stone-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" /> যোগাযোগ
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-sm">{artist.email}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-sm">{artist.phone}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bio & Portfolio */}
          <div className="flex-1 pt-8 md:pt-32">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-16"
            >
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">শিল্পীর কথা</h2>
              <p className="text-xl text-stone-600 leading-relaxed italic">
                "{artist.bio || "আমি একজন স্বাধীন শিল্পী, রঙের মাধ্যমে আমার ভাবনাগুলো ফুটিয়ে তুলতে ভালোবাসি।"}"
              </p>
              <div className="flex flex-wrap gap-2 mt-8">
                {artist.art_types.map((type, idx) => (
                  <span key={idx} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold">
                    #{type}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="mb-12 flex items-center justify-between">
              <h2 className="text-4xl font-serif font-bold text-stone-900">পোর্টফোলিও</h2>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-sm">{artworks.length} টি শিল্পকর্ম</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {artworks.map((art) => (
                <motion.div 
                  key={art.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link to={`/artwork/${art.id}`} className="block">
                    <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-stone-100 artwork-card-shadow transition-all duration-500 group-hover:-translate-y-2">
                      <img 
                        src={art.image_url} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white text-2xl font-bold mb-2">{art.title}</p>
                            <p className="text-emerald-400 text-xl font-bold">৳{art.price.toLocaleString()}</p>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-xl">
                            <ArrowRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {artworks.length === 0 && (
              <div className="py-20 text-center bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
                <Palette className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-stone-900">এখনো কোনো শিল্পকর্ম নেই</h3>
                <p className="text-stone-500">এই শিল্পী এখনো কোনো শিল্পকর্ম প্রকাশ করেননি।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
