import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Palette, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artist } from '../types';

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('artists').select('*').eq('is_active', true).order('total_sales', { ascending: false })
      .then(({ data }) => { setArtists(data || []); setLoading(false); });
  }, []);

  const filtered = artists.filter(a =>
    !search || a.full_name.toLowerCase().includes(search.toLowerCase()) || a.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-2">শিল্পীগণ</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">আমাদের <span className="text-emerald-600">শিল্পীরা</span></h1>
          <p className="text-stone-500 text-lg mb-8">দেশের সেরা ও যাচাইকৃত শিল্পীদের সাথে পরিচিত হন</p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" placeholder="শিল্পীর নাম বা জেলা খুঁজুন..." className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-3xl p-6 h-56" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-500">কোনো শিল্পী পাওয়া যায়নি</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((artist, i) => (
              <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/artist/${artist.id}`} className="block bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-28 bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6ee7b7 0%, transparent 50%)'}} />
                    <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} alt={artist.full_name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg relative z-10" />
                    {artist.is_verified && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-md z-10">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-stone-900 group-hover:text-emerald-600 transition-colors text-sm leading-tight">{artist.full_name}</h3>
                    {artist.district && <p className="text-stone-400 text-xs mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{artist.district}</p>}
                    <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-stone-50">
                      <div className="text-center">
                        <p className="font-bold text-stone-900 text-sm">{artist.total_sales}</p>
                        <p className="text-stone-400 text-[10px]">বিক্রয়</p>
                      </div>
                      <div className="w-px h-6 bg-stone-100" />
                      <div className="text-center flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <p className="font-bold text-stone-900 text-sm">{(artist.rating_avg || 0).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
