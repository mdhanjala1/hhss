import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Palette, Search, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artist } from '../types';

const ALL_DISTRICTS = [
  'ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','সিলেট','বরিশাল','রংপুর','ময়মনসিংহ',
  'কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টাঙ্গাইল','ব্রাহ্মণবাড়িয়া','ফেনী','নোয়াখালী',
  'হবিগঞ্জ','মৌলভীবাজার','সুনামগঞ্জ','নেত্রকোনা','কিশোরগঞ্জ','জামালপুর','শেরপুর',
  'ফরিদপুর','মাদারীপুর','গোপালগঞ্জ','মুন্সিগঞ্জ','নরসিংদী','মানিকগঞ্জ','পাবনা',
  'সিরাজগঞ্জ','নাটোর','বগুড়া','দিনাজপুর','রংপুর','কুড়িগ্রাম','যশোর','খাগড়াছড়ি',
  'কক্সবাজার','সাতক্ষীরা','কুষ্টিয়া',
];

// Show only districts that have artists
export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('artists').select('*').eq('is_active', true).order('total_sales', { ascending: false })
      .then(({ data }) => {
        const arr = data || [];
        setArtists(arr);
        // Extract unique districts present in data
        const dists = Array.from(new Set(arr.map(a => a.district).filter(Boolean))).sort() as string[];
        setAvailableDistricts(dists);
        setLoading(false);
      });
  }, []);

  const filtered = artists.filter(a => {
    // search by name OR district (case-insensitive, works for Bengali)
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || a.full_name.toLowerCase().includes(q)
      || (a.district || '').toLowerCase().includes(q)
      || (a.bio || '').toLowerCase().includes(q);
    const matchDist = !selectedDistrict || a.district === selectedDistrict;
    const matchVerified = !verifiedOnly || a.is_verified;
    return matchSearch && matchDist && matchVerified;
  });

  // Group by district for display when a district is selected
  const groupedByDistrict = selectedDistrict
    ? { [selectedDistrict]: filtered }
    : filtered.reduce((acc, a) => {
        const d = a.district || 'অন্যান্য';
        if (!acc[d]) acc[d] = [];
        acc[d].push(a);
        return acc;
      }, {} as Record<string, Artist[]>);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">

      {/* Hero header */}
      <div className="bg-stone-900 pb-16 pt-10 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(16,185,129,0.12) 0%, transparent 65%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">শিল্পীগণ</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            আমাদের <span className="text-emerald-400">শিল্পীরা</span>
          </h1>
          <p className="text-stone-400 text-lg mb-8">দেশের সেরা ও Verified শিল্পীদের সাথে পরিচিত হন</p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="শিল্পীর নাম বা জেলা লিখুন যেমন: ঢাকা, রাজশাহী..."
              className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 text-white placeholder-stone-500 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm backdrop-blur-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* District filter chips */}
        {availableDistricts.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">জেলা অনুযায়ী</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDistrict('')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  !selectedDistrict
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}>
                সব জেলা ({artists.length})
              </button>
              {availableDistricts.map(d => {
                const count = artists.filter(a => a.district === d).length;
                return (
                  <button key={d} onClick={() => setSelectedDistrict(d === selectedDistrict ? '' : d)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedDistrict === d
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300 hover:text-emerald-600'
                    }`}>
                    {d} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified toggle */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <p className="text-stone-500 text-sm">
            <span className="font-bold text-stone-900">{filtered.length}জন</span> শিল্পী পাওয়া গেছে
            {selectedDistrict && <span className="text-emerald-600"> — {selectedDistrict}</span>}
          </p>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              verifiedOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300'
            }`}>
            <ShieldCheck className="w-3.5 h-3.5" /> শুধু Verified
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <div key={i} className="animate-pulse bg-stone-100 rounded-3xl h-64" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-400">কোনো শিল্পী পাওয়া যায়নি</h3>
            <p className="text-stone-400 text-sm mt-2">অন্য জেলা বা নাম দিয়ে খুঁজুন</p>
          </div>
        ) : selectedDistrict || search ? (
          /* Flat grid when filtered */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map((artist, i) => <ArtistCard key={artist.id} artist={artist} i={i} />)}
          </div>
        ) : (
          /* Grouped by district when showing all */
          <div className="space-y-12">
            {Object.entries(groupedByDistrict).sort().map(([district, distArtists]) => (
              <div key={district}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-lg font-bold text-stone-900">{district}</h2>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200">
                    {distArtists.length}জন
                  </span>
                  <div className="flex-1 h-px bg-stone-100" />
                  <button onClick={() => setSelectedDistrict(district)} className="text-xs text-stone-400 hover:text-emerald-600 transition-colors font-semibold">
                    সব দেখুন →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {distArtists.slice(0, 5).map((artist, i) => <ArtistCard key={artist.id} artist={artist} i={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ artist, i }: { artist: Artist; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
      <Link to={`/artist/${artist.id}`}
        className="block bg-white rounded-3xl overflow-hidden border-2 border-stone-100 hover:border-emerald-300 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group text-center">
        {/* Profile section with gradient bg */}
        <div className="relative pt-6 pb-4 px-4 flex flex-col items-center"
          style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)' }}>
          <div className="relative mb-3">
            <img
              src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
              alt={artist.full_name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            {artist.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-600 transition-colors leading-tight">{artist.full_name}</h3>
          {artist.district && (
            <p className="text-stone-400 text-[10px] mt-1 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />{artist.district}
            </p>
          )}
        </div>
        {/* Bio */}
        {artist.bio && (
          <div className="px-4 pb-3">
            <p className="text-stone-400 text-[10px] line-clamp-2 leading-relaxed">{artist.bio}</p>
          </div>
        )}
        {/* Stats */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-stone-100">
          <div className="text-center">
            <p className="font-bold text-stone-900 text-sm">{artist.total_sales}</p>
            <p className="text-stone-400 text-[9px]">বিক্রয়</p>
          </div>
          <div className="w-px h-5 bg-stone-100" />
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <p className="font-bold text-stone-900 text-sm">{(artist.rating_avg || 0).toFixed(1)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
