import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Palette, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artist } from '../types';

const DISTRICTS_FILTER = ['সব জেলা','ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','সিলেট','বরিশাল','রংপুর','ময়মনসিংহ'];

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [distFilter, setDistFilter] = useState('সব জেলা');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    supabase.from('artists').select('*').eq('is_active', true).order('total_sales', { ascending: false })
      .then(({ data }) => { setArtists(data || []); setLoading(false); });
  }, []);

  const filtered = artists.filter(a => {
    const matchSearch = !search || a.full_name.toLowerCase().includes(search.toLowerCase()) || a.district?.toLowerCase().includes(search.toLowerCase());
    const matchDist = distFilter === 'সব জেলা' || a.district === distFilter;
    const matchVerified = !verifiedOnly || a.is_verified;
    return matchSearch && matchDist && matchVerified;
  });

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: '#faf8f4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#b5944a' }}>শিল্পীগণ</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-stone-900 mb-3">আমাদের <span style={{ color: '#b5944a' }}>শিল্পীরা</span></h1>
          <p className="text-stone-500 text-lg">দেশের সেরা ও যাচাইকৃত শিল্পীদের সাথে পরিচিত হন</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" placeholder="শিল্পীর নাম বা জেলা..." className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 outline-none text-sm" style={{ '--tw-ring-color': '#b5944a' } as any} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {DISTRICTS_FILTER.map(d => (
              <button key={d} onClick={() => setDistFilter(d)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${distFilter === d ? 'text-white' : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-400'}`}
                style={distFilter === d ? { background: '#b5944a' } : {}}>
                {d}
              </button>
            ))}
          </div>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${verifiedOnly ? 'text-white' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
            style={verifiedOnly ? { background: '#b5944a', borderColor: '#b5944a' } : {}}>
            <ShieldCheck className="w-3.5 h-3.5" /> শুধু যাচাইকৃত
          </button>
        </div>

        <p className="text-stone-400 text-sm mb-6">{filtered.length}জন শিল্পী পাওয়া গেছে</p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-3xl p-6 h-56 border border-stone-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-500">কোনো শিল্পী পাওয়া যায়নি</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((artist, i) => (
              <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/artist/${artist.id}`}
                  className="block bg-white rounded-3xl overflow-hidden border border-stone-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(181,148,74,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>
                  <div className="relative h-28 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(181,148,74,0.08),rgba(181,148,74,0.03))' }}>
                    <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                      alt={artist.full_name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                    {artist.is_verified && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ background: '#b5944a' }}>
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-stone-900 group-hover:text-[#b5944a] transition-colors text-sm leading-tight font-display">{artist.full_name}</h3>
                    {artist.district && <p className="text-stone-400 text-xs mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{artist.district}</p>}
                    {artist.bio && <p className="text-stone-400 text-xs mt-2 line-clamp-2 leading-relaxed">{artist.bio}</p>}
                    <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-50">
                      <div className="text-center">
                        <p className="font-bold text-stone-900 text-sm">{artist.total_sales}</p>
                        <p className="text-stone-400 text-[10px]">বিক্রয়</p>
                      </div>
                      <div className="w-px h-6 bg-stone-100" />
                      <div className="text-center flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" style={{ color: '#b5944a' }} />
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
