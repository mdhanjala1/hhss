import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Star, MapPin, Search, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artist } from '../types';

// ─── Color tokens ───────────────────────────────────────────────────
const W = '#c2a06e';
const WD = '#1e1208';
const WL = '#faf6f0';

// Bangladesh divisions with their districts
const DIVISIONS = [
  {
    name: 'ঢাকা',
    districts: ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'টাঙ্গাইল', 'মানিকগঞ্জ', 'নরসিংদী', 'মুন্সীগঞ্জ', 'ফরিদপুর', 'গোপালগঞ্জ', 'মাদারীপুর', 'শরীয়তপুর', 'রাজবাড়ী', 'কিশোরগঞ্জ'],
  },
  {
    name: 'চট্টগ্রাম',
    districts: ['চট্টগ্রাম', 'কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'ফেনী', 'লক্ষ্মীপুর', 'নোয়াখালী', 'খাগড়াছড়ি', 'রাঙ্গামাটি', 'বান্দরবান', 'কক্সবাজার'],
  },
  {
    name: 'রাজশাহী',
    districts: ['রাজশাহী', 'নাটোর', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'বগুড়া', 'জয়পুরহাট', 'সিরাজগঞ্জ', 'পাবনা'],
  },
  {
    name: 'খুলনা',
    districts: ['খুলনা', 'কুষ্টিয়া', 'মেহেরপুর', 'চুয়াডাঙ্গা', 'ঝিনাইদহ', 'মাগুরা', 'নড়াইল', 'সাতক্ষীরা', 'বাগেরহাট', 'যশোর'],
  },
  {
    name: 'বরিশাল',
    districts: ['বরিশাল', 'পিরোজপুর', 'ঝালকাঠি', 'বরগুনা', 'পটুয়াখালী', 'ভোলা'],
  },
  {
    name: 'সিলেট',
    districts: ['সিলেট', 'হবিগঞ্জ', 'মৌলভীবাজার', 'সুনামগঞ্জ'],
  },
  {
    name: 'ময়মনসিংহ',
    districts: ['ময়মনসিংহ', 'জামালপুর', 'শেরপুর', 'নেত্রকোণা'],
  },
  {
    name: 'রংপুর',
    districts: ['রংপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'লালমনিরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়', 'দিনাজপুর'],
  },
];

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('সব');

  useEffect(() => {
    supabase.from('artists').select('*').eq('is_active', true).order('total_sales', { ascending: false })
      .then(({ data }) => { setArtists(data || []); setLoading(false); });
  }, []);

  // Filter: by division (check if artist's district belongs to that division) OR by search
  const divDistricts = selectedDiv === 'সব' ? null : DIVISIONS.find(d => d.name === selectedDiv)?.districts;

  const filtered = artists.filter(a => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || a.full_name.toLowerCase().includes(q)
      || (a.district || '').toLowerCase().includes(q)
      || (a.bio || '').toLowerCase().includes(q);
    const matchDiv = !divDistricts || divDistricts.includes(a.district || '');
    return matchSearch && matchDiv;
  });

  const divTabs = ['সব', ...DIVISIONS.map(d => d.name)];

  return (
    <div className="min-h-screen" style={{ background: WL }}>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden pb-12 pt-8" style={{ background: WD }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(194,160,110,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(194,160,110,0.05) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: W }}>শিল্পীগণ</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                আমাদের <span style={{ color: W }}>শিল্পীরা</span>
              </h1>
              <p style={{ color: 'var(--text3)' }}>দেশের সেরা Verified শিল্পীদের সাথে পরিচিত হন</p>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text3)' }}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: W }} />
                <span>{filtered.length} জন শিল্পী</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: W }} />
            <input
              type="text"
              placeholder="শিল্পীর নাম বা জেলার নাম লিখুন..."
              className="w-full pl-14 pr-5 py-4 rounded-2xl text-white placeholder-stone-500 outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(194,160,110,0.25)',
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'rgba(194,160,110,0.6)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(194,160,110,0.25)'; }}
            />
          </div>
        </div>
      </div>

      {/* ── Division Filter Tabs ── */}
      <div className="sticky top-16 z-30 py-3 border-b overflow-x-auto"
        style={{ background: 'rgba(250,246,240,0.95)', backdropFilter: 'blur(12px)', borderColor: '#e8d9c0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 no-scrollbar min-w-max">
            {divTabs.map(div => (
              <button key={div} onClick={() => setSelectedDiv(div)}
                className="px-5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
                style={selectedDiv === div
                  ? { background: `linear-gradient(135deg,${W},#8b6914)`, color: 'white', boxShadow: '0 4px 14px rgba(194,160,110,0.4)' }
                  : { background: '#ffffff', color: '#8b6914', border: '1.5px solid #e8d9c0' }}>
                {div}
                {div !== 'সব' && (
                  <span className="ml-2 text-[10px] opacity-60">
                    ({artists.filter(a => DIVISIONS.find(d => d.name === div)?.districts.includes(a.district || '')).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Artist Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl border overflow-hidden" style={{ borderColor: '#e8d9c0' }}>
                <div className="h-40 rounded-t-3xl" style={{ background: '#f5ead8' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded" style={{ background: '#f5ead8', width: '70%' }} />
                  <div className="h-2.5 rounded" style={{ background: '#f5ead8', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: '#f5ead8' }}>
              <Users className="w-10 h-10" style={{ color: W }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: WD }}>কোনো শিল্পী পাওয়া যায়নি</h3>
            <p className="text-sm mb-6" style={{ color: '#9a7050' }}>অন্য কীওয়ার্ড বা বিভাগ চেষ্টা করুন</p>
            <button onClick={() => { setSearch(''); setSelectedDiv('সব'); }}
              className="px-6 py-3 text-white rounded-xl font-bold"
              style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
              রিসেট করুন
            </button>
          </div>
        ) : (
          <>
            {/* Selected division label */}
            {selectedDiv !== 'সব' && (
              <div className="mb-6 flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(to bottom, ${W}, transparent)` }} />
                <div>
                  <span className="font-bold" style={{ color: WD }}>{selectedDiv} বিভাগ</span>
                  <span className="text-sm ml-2" style={{ color: '#9a7050' }}>— {filtered.length} জন শিল্পী</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filtered.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/artist/${a.id}`}
                    className="block rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
                    style={{ background: '#ffffff', border: '2px solid #e8d9c0' }}>

                    {/* Profile top */}
                    <div className="relative pt-7 pb-4 px-4 flex flex-col items-center"
                      style={{ background: 'linear-gradient(180deg, #fdf6ec 0%, #fefaf5 100%)' }}>
                      {/* Verified badge top-right */}
                      {a.is_verified && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow"
                          style={{ background: W }}>
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="relative mb-3">
                        <img
                          src={a.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}`}
                          alt={a.full_name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
                          style={{ background: '#4ade80' }} />
                      </div>

                      <h3 className="font-bold text-sm text-center leading-tight group-hover:transition-colors"
                        style={{ color: WD }}>
                        {a.full_name}
                      </h3>

                      {a.district && (
                        <p className="text-[11px] mt-1 flex items-center gap-0.5" style={{ color: '#9a7050' }}>
                          <MapPin className="w-2.5 h-2.5" />{a.district}
                        </p>
                      )}

                      {a.bio && (
                        <p className="text-[10px] mt-2 text-center line-clamp-2 leading-relaxed" style={{ color: '#9a7050' }}>
                          {a.bio}
                        </p>
                      )}
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#f0e4d0' }}>
                      <div className="text-center">
                        <p className="font-bold text-xs" style={{ color: WD }}>{a.total_sales || 0}</p>
                        <p className="text-[9px]" style={{ color: '#9a7050' }}>বিক্রয়</p>
                      </div>
                      <div className="w-px h-5" style={{ background: '#e8d9c0' }} />
                      <div className="text-center flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" style={{ color: W }} />
                        <p className="font-bold text-xs" style={{ color: WD }}>{(a.rating_avg || 0).toFixed(1)}</p>
                      </div>
                      <div className="w-px h-5" style={{ background: '#e8d9c0' }} />
                      <div className="text-center">
                        <p className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={a.is_verified
                            ? { background: 'rgba(194,160,110,0.15)', color: '#8b6914' }
                            : { background: '#f5ead8', color: '#9a7050' }}>
                          {a.is_verified ? 'যাচাইকৃত' : 'সাধারণ'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="py-16 text-center border-t" style={{ background: '#f5ead8', borderColor: '#e8d9c0' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: W }}>শিল্পী হন</p>
        <h2 className="text-2xl font-bold mb-3" style={{ color: WD }}>আপনিও কি শিল্পী?</h2>
        <p className="text-sm mb-6" style={{ color: '#9a7050' }}>বিনামূল্যে যোগ দিন এবং হাজারো ক্রেতার কাছে আপনার শিল্পকর্ম পৌঁছে দিন</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg"
          style={{ background: `linear-gradient(135deg,${W},#8b6914)`, boxShadow: '0 6px 20px rgba(194,160,110,0.4)' }}>
          শিল্পী হিসেবে যোগ দিন
        </Link>
      </div>
    </div>
  );
}
