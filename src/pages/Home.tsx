import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowRight, Star, ShieldCheck, Truck,
  Heart, ChevronDown, Award, ChevronLeft, Package,
  ChevronRight as ChevronRightIcon, MapPin, Zap, Palette, Sparkles,
  Search, Users, CheckCircle, MessageCircle, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artwork, Artist } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&q=90&w=1600',
    tag: 'আরবি ক্যালিগ্রাফি',
    heading: 'শিল্পের ভাষায়',
    accent: 'হৃদয়ের কথা',
    sub: 'বাংলাদেশের সেরা ক্যালিগ্রাফি শিল্পীদের অনন্য সংগ্রহ'
  },
  {
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=90&w=1600',
    tag: 'পেইন্টিং',
    heading: 'রঙের মাধ্যমে',
    accent: 'জীবনের ছবি',
    sub: 'তেলরঙ, জলরঙ ও আক্রেলিকের অনন্য চিত্রকর্ম'
  },
  {
    image: 'https://images.unsplash.com/photo-1501084291732-13b1ba8f0ebc?auto=format&fit=crop&q=90&w=1600',
    tag: 'হস্তশিল্প',
    heading: 'হাতের ছোঁয়ায়',
    accent: 'অনন্য সৌন্দর্য',
    sub: 'দক্ষ কারিগরদের হাতে তৈরি শিল্পকর্ম'
  },
];

const FAQ_DATA = [
  { q: 'শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?', a: 'পছন্দের শিল্পকর্ম কার্টে যোগ করুন এবং অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারিতে পণ্য পেয়ে পেমেন্ট করুন।' },
  { q: 'ডেলিভারি চার্জ কত?', a: 'আমরা সারা বাংলাদেশে ডেলিভারি দিই। ডেলিভারি চার্জ অর্ডার করার সময় জানানো হবে।' },
  { q: 'আমি কি শিল্পী হিসেবে যোগ দিতে পারি?', a: 'হ্যাঁ! যেকোনো শিল্পী বিনামূল্যে আমাদের প্ল্যাটফর্মে যোগ দিতে পারেন। NID যাচাইয়ের পর শিল্পকর্ম আপলোড করা যাবে।' },
  { q: 'পেমেন্ট পদ্ধতি কী?', a: 'ক্যাশ অন ডেলিভারি — পণ্য পেয়ে সন্তুষ্ট হলে পেমেন্ট করুন। bKash, Nagad, Rocket ও ক্যাশ গ্রহণযোগ্য।' },
  { q: 'শিল্পকর্ম ফেরত দেওয়া যাবে?', a: 'হ্যাঁ, ক্ষতিগ্রস্ত পণ্য পেলে ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
];

const TESTIMONIALS = [
  { name: 'ফারহান আহমেদ', city: 'ঢাকা', rating: 5, text: 'অসাধারণ একটি প্ল্যাটফর্ম! আমি আমার ড্রয়িং রুমের জন্য একটি ক্যালিগ্রাফি কিনেছি — মানের দিক থেকে অতুলনীয়। শিল্পী খুব যত্ন করে প্যাক করে পাঠিয়েছেন।', avatar: 'farhan' },
  { name: 'নাজমুন নাহার', city: 'চট্টগ্রাম', rating: 5, text: 'আমি একজন শিল্পী হিসেবে এখানে যোগ দিয়েছি। মাত্র দুই সপ্তাহে তিনটি অর্ডার পেয়েছি। এডমিন খুব দ্রুত সাড়া দেন।', avatar: 'najma' },
  { name: 'রাকিব হোসেন', city: 'রাজশাহী', rating: 5, text: 'শিল্পশপ আমার মতো শিল্পপ্রেমীদের জন্য স্বর্গ। দেশের বিভিন্ন প্রান্তের শিল্পীদের কাজ একটি জায়গায় পাওয়া যায় — এটা সত্যিই অসাধারণ।', avatar: 'rakib' },
  { name: 'সুমাইয়া ইসলাম', city: 'সিলেট', rating: 5, text: 'অর্ডার দেওয়া থেকে ডেলিভারি পর্যন্ত পুরো অভিজ্ঞতাটা ছিল দুর্দান্ত। শিল্পকর্মের মান আমার প্রত্যাশার চেয়ে অনেক বেশি ভালো ছিল।', avatar: 'sumaiya' },
];

// Section configs — alternating backgrounds
const SECTION_STYLES = [
  { bg: 'bg-white', accent: 'from-emerald-50 to-teal-50', tag: 'bg-emerald-900/80 text-emerald-300 border-emerald-700', border: 'hover:border-emerald-300 hover:shadow-emerald-100/60', tagLabel: 'নতুন' },
  { bg: 'bg-amber-50', accent: 'from-amber-50 to-orange-50', tag: 'bg-amber-900/80 text-amber-300 border-amber-700', border: 'hover:border-amber-300 hover:shadow-amber-100/60', tagLabel: 'নির্বাচিত' },
  { bg: 'bg-blue-50', accent: 'from-blue-50 to-indigo-50', tag: 'bg-blue-900/80 text-blue-300 border-blue-700', border: 'hover:border-blue-300 hover:shadow-blue-100/60', tagLabel: 'ক্যালিগ্রাফি' },
  { bg: 'bg-emerald-50', accent: 'from-emerald-50 to-teal-50', tag: 'bg-emerald-900/80 text-emerald-300 border-emerald-700', border: 'hover:border-emerald-300 hover:shadow-emerald-100/60', tagLabel: 'পেইন্টিং' },
  { bg: 'bg-purple-50', accent: 'from-purple-50 to-pink-50', tag: 'bg-purple-900/80 text-purple-300 border-purple-700', border: 'hover:border-purple-300 hover:shadow-purple-100/60', tagLabel: 'শিল্পকর্ম' },
];

function ArtworkCard({ art, style }: { art: Artwork; style: typeof SECTION_STYLES[0] }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(art.id);
  const inCart = isInCart(art.id);

  const discountedPrice = art.discount_percent
    ? Math.round(art.price * (1 - art.discount_percent / 100))
    : null;

  return (
    <div className={`group bg-white rounded-3xl overflow-hidden border-2 border-stone-100 ${style.border} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative`}>
      <Link to={`/artwork/${art.id}`} className="block relative overflow-hidden bg-stone-100" style={{ aspectRatio: '3/4' }}>
        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {art.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow">
            <Star className="w-2.5 h-2.5 fill-current" />ফিচারড
          </span>
        )}
        {art.discount_percent && art.discount_percent > 0 && (
          <span className="absolute top-3 right-12 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow">
            -{art.discount_percent}%
          </span>
        )}
      </Link>
      <button onClick={e => { e.preventDefault(); toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ যোগ হয়েছে'); }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md z-10 transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-400'}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="p-4">
        <Link to={`/artwork/${art.id}`}>
          <h3 className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3>
        </Link>
        <p className="text-stone-400 text-xs mt-0.5 line-clamp-1">{art.artist?.full_name}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            {discountedPrice ? (
              <div>
                <p className="font-bold text-stone-900 text-sm">৳{discountedPrice.toLocaleString()}</p>
                <p className="text-stone-400 text-xs line-through">৳{art.price.toLocaleString()}</p>
              </div>
            ) : (
              <p className="font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
            )}
          </div>
          <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে! 🛒'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${inCart ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {inCart ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, link, styleIdx }: { title: string; sub?: string; link: string; styleIdx: number }) {
  // Large decorative text in background corner
  const bg = ['#059669', '#d97706', '#2563eb', '#059669', '#7c3aed'][styleIdx % 5];
  return (
    <div className="flex items-end justify-between mb-10 relative overflow-hidden">
      {/* Corner typography decoration */}
      <div className="absolute -left-4 -top-8 pointer-events-none select-none" aria-hidden>
        <span className="text-[140px] font-black leading-none opacity-[0.045]" style={{ color: bg, letterSpacing: '-0.04em' }}>
          {['01','02','03','04','05'][styleIdx % 5]}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: bg }}>
          {['সম্প্রতি যুক্ত', 'বিশেষ বাছাই', 'ইসলামিক আর্ট', 'চিত্রকলা', 'বিশেষ শিল্পকর্ম'][styleIdx % 5]}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">{title}</h2>
        {sub && <p className="text-stone-500 text-sm mt-1">{sub}</p>}
      </div>
      <Link to={link} className="relative z-10 flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-3" style={{ color: bg }}>
        সব দেখুন <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ArtSection({ title, sub, artworks, styleIdx = 0 }: { title: string; sub?: string; artworks: Artwork[]; styleIdx?: number }) {
  if (!artworks.length) return null;
  const style = SECTION_STYLES[styleIdx % SECTION_STYLES.length];
  return (
    <section className={`py-16 ${style.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} sub={sub} link="/marketplace" styleIdx={styleIdx} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {artworks.slice(0, 4).map(art => <ArtworkCard key={art.id} art={art} style={style} />)}
        </div>
      </div>
    </section>
  );
}

// SVG icons for categories
const CAT_ICONS: Record<string, React.ReactNode> = {
  calligraphy: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <path d="M8 32 Q14 20 20 8 Q22 16 26 14 Q30 12 32 20 Q28 22 24 28 Q22 32 8 32Z" fill="currentColor" opacity="0.15"/>
      <path d="M12 28 Q16 20 20 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 10 Q25 18 28 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10" cy="30" r="2.5" fill="currentColor" opacity="0.6"/>
    </svg>
  ),
  painting: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <rect x="6" y="6" width="22" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.7"/>
      <circle cx="20" cy="12" r="2.5" fill="#f59e0b" opacity="0.9"/>
      <circle cx="12" cy="20" r="2.5" fill="#3b82f6" opacity="0.9"/>
      <path d="M32 12 Q35 16 32 20 Q29 24 32 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  watercolor: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <ellipse cx="20" cy="24" rx="11" ry="8" fill="currentColor" opacity="0.12"/>
      <path d="M20 6 Q24 14 24 20 Q24 26 20 30 Q16 26 16 20 Q16 14 20 6Z" fill="currentColor" opacity="0.7"/>
      <path d="M14 16 Q8 20 12 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <rect x="5" y="8" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08"/>
      <path d="M13 32 L18 26 M27 32 L22 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 32 L29 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="13" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="18" y="13" width="4" height="4" rx="1" fill="#10b981" opacity="0.7"/>
    </svg>
  ),
  handicraft: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <path d="M20 6 L24 16 L35 16 L26 22 L30 33 L20 26 L10 33 L14 22 L5 16 L16 16 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/>
      <path d="M20 10 L23 18 L32 18 L25 23 L28 32 L20 27 L12 32 L15 23 L8 18 L17 18 Z" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  sketch: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <path d="M10 28 L28 10 L32 14 L14 32 L8 34 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round"/>
      <path d="M24 14 L28 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="33" r="2" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
};

const CATEGORIES = [
  { key: 'Arabic Calligraphy', label: 'ক্যালিগ্রাফি', icon: 'calligraphy', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  { key: 'Painting', label: 'পেইন্টিং', icon: 'painting', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'Watercolor', label: 'জলরঙ', icon: 'watercolor', color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  { key: 'Digital Art', label: 'ডিজিটাল আর্ট', icon: 'digital', color: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
  { key: 'Handicraft', label: 'হস্তশিল্প', icon: 'handicraft', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: 'Sketch', label: 'স্কেচ', icon: 'sketch', color: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [featuredArt, setFeaturedArt] = useState<Artwork[]>([]);
  const [calligraphyArt, setCalligraphyArt] = useState<Artwork[]>([]);
  const [paintingArt, setPaintingArt] = useState<Artwork[]>([]);
  const [handmadeArt, setHandmadeArt] = useState<Artwork[]>([]);
  const [newArt, setNewArt] = useState<Artwork[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!paused) {
      timer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    }
    return () => clearInterval(timer.current);
  }, [paused]);

  useEffect(() => {
    (async () => {
      const [{ data: feat }, { data: cal }, { data: paint }, { data: hand }, { data: newA }, { data: arts }] = await Promise.all([
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('is_featured', true).limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Arabic Calligraphy').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Painting').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Handicraft').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
        supabase.from('artists').select('*').eq('is_verified', true).eq('is_active', true).order('total_sales', { ascending: false }).limit(6),
      ]);
      setFeaturedArt(feat || []); setCalligraphyArt(cal || []); setPaintingArt(paint || []);
      setHandmadeArt(hand || []); setNewArt(newA || []); setFeaturedArtists(arts || []);
    })();
  }, []);

  const goTo = (i: number) => { setSlide(i); setPaused(true); setTimeout(() => setPaused(false), 8000); };
  const cur = HERO_SLIDES[slide];

  return (
    <div className="bg-white">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-stone-900" style={{ minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          <motion.div key={slide} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }} className="absolute inset-0">
            <img src={cur.image} alt="" className="w-full h-full object-cover" style={{ minHeight: '100vh' }}
              onError={(e: any) => { e.target.style.display = 'none'; }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.20) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 w-full flex items-center" style={{ minHeight: '100vh' }}>
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl py-32">
              <motion.span initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{ background: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.5)', color: '#6ee7b7' }}>
                <Sparkles className="w-3.5 h-3.5" />{cur.tag}
              </motion.span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.06] mb-6 tracking-tight">
                {cur.heading}<br /><span className="text-emerald-400">{cur.accent}</span>
              </h1>
              <p className="text-stone-300 text-lg leading-relaxed mb-10 max-w-lg">{cur.sub}</p>
              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link to="/marketplace"
                  className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40">
                  মার্কেটপ্লেস দেখুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 transition-all">
                  শিল্পী হিসেবে যোগ দিন
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-8 border-t border-white/15">
                {[['৫০০+','শিল্পী'],['২৫০০+','শিল্পকর্ম'],['৬৪','জেলায় ডেলিভারি'],['৫কে+','সন্তুষ্ট ক্রেতা']].map(([n,l]) => (
                  <div key={l}><p className="text-xl font-bold text-white">{n}</p><p className="text-stone-400 text-xs">{l}</p></div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow controls */}
        {([[-1, ChevronLeft, 'left-5'], [1, ChevronRightIcon, 'right-5']] as const).map(([dir, Icon, cls], idx) => (
          <button key={idx} onClick={() => goTo((slide + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className={`absolute ${cls} top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-emerald-600/80 transition-all backdrop-blur-sm`}>
            <Icon className="w-5 h-5" />
          </button>
        ))}

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="h-2 rounded-full transition-all"
              style={{ width: i === slide ? '28px' : '8px', background: i === slide ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>

        {/* Thumbnail nav */}
        <div className="absolute bottom-6 right-6 z-30 hidden lg:flex gap-2.5">
          {HERO_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`w-16 h-10 rounded-xl overflow-hidden border-2 transition-all ${i === slide ? 'border-emerald-400 scale-110 shadow-lg' : 'border-white/20 hover:border-white/50'}`}>
              <img src={s.image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <div className="bg-stone-900 border-y border-emerald-900/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: '১০০% অরিজিনাল শিল্পকর্ম', c: 'text-emerald-400' },
              { icon: <Truck className="w-4 h-4" />, text: 'পুরো দেশে ডেলিভারি', c: 'text-blue-400' },
              { icon: <Award className="w-4 h-4" />, text: 'Verified শিল্পী', c: 'text-amber-400' },
              { icon: <Zap className="w-4 h-4" />, text: '৭ দিন রিটার্ন পলিসি', c: 'text-red-400' },
              { icon: <MessageCircle className="w-4 h-4" />, text: '২৪/৭ কাস্টমার সাপোর্ট', c: 'text-purple-400' },
            ].map((f, i) => (
              <div key={i} className={`flex items-center gap-2 ${f.c}`}>{f.icon}<span className="text-stone-300">{f.text}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.25em] mb-3">বিভাগ</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900">শিল্পের ধরন বেছে নিন</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.key} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/marketplace?category=${cat.key}`}
                  className="group flex flex-col items-center p-5 sm:p-6 rounded-3xl border-2 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                  style={{ background: cat.bg, borderColor: cat.border }}>
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${cat.color}15, transparent 70%)` }} />
                  <div className="relative z-10 mb-3" style={{ color: cat.color }}>{CAT_ICONS[cat.icon]}</div>
                  <h3 className="relative z-10 font-bold text-xs sm:text-sm text-center" style={{ color: cat.color }}>{cat.label}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ARTWORK SECTIONS (5, alternating bg) ══ */}
      <ArtSection title="নতুন শিল্পকর্ম" artworks={newArt} styleIdx={0} />
      <ArtSection title="নির্বাচিত শিল্পকর্ম" artworks={featuredArt} styleIdx={1} />
      <ArtSection title="আরবি ক্যালিগ্রাফি" artworks={calligraphyArt} styleIdx={2} />
      <ArtSection title="পেইন্টিং" artworks={paintingArt} styleIdx={3} />
      <ArtSection title="বিশেষ শিল্পকর্ম" artworks={handmadeArt} styleIdx={4} />

      {/* ══ FEATURED ARTISTS ══ */}
      {featuredArtists.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">শিল্পীগণ</p>
                <h2 className="text-2xl sm:text-4xl font-bold text-stone-900">Verified <span className="text-emerald-600">শিল্পীরা</span></h2>
              </div>
              <Link to="/artists" className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all">
                সব শিল্পী <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredArtists.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/artist/${a.id}`}
                    className="block bg-white border-2 border-stone-100 hover:border-emerald-300 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group text-center">
                    <div className="pt-6 pb-3 px-3 flex flex-col items-center"
                      style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 70%)' }}>
                      <div className="relative mb-2">
                        <img src={a.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}`}
                          alt={a.full_name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                        {a.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow">
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900 text-xs group-hover:text-emerald-600 transition-colors leading-tight">{a.full_name}</h3>
                      {a.district && <p className="text-stone-400 text-[10px] mt-0.5 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{a.district}</p>}
                    </div>
                    {a.bio && <p className="text-stone-400 text-[10px] px-3 pb-2 line-clamp-2 leading-relaxed">{a.bio}</p>}
                    <div className="flex items-center justify-center gap-3 px-3 py-3 border-t border-stone-100">
                      <div><p className="font-bold text-stone-900 text-xs">{a.total_sales}</p><p className="text-stone-400 text-[9px]">বিক্রয়</p></div>
                      <div className="w-px h-4 bg-stone-100" />
                      <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-current" /><p className="font-bold text-stone-900 text-xs">{(a.rating_avg || 0).toFixed(1)}</p></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS (mini) ══ */}
      <section className="py-20 bg-stone-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60 L60 0' stroke='%2310b981' stroke-width='0.3' opacity='0.12'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">গাইড</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-3">কীভাবে ব্যবহার করবেন?</h2>
            <p className="text-stone-500">মাত্র কয়েকটি ধাপে কেনাকাটা বা বিক্রি শুরু করুন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { icon: <Search className="w-7 h-7" />, step: '০১', title: 'খুঁজুন', desc: 'ক্যাটাগরি বা শিল্পী নাম দিয়ে পছন্দের শিল্পকর্ম খুঁজুন', color: '#059669' },
              { icon: <ShoppingBag className="w-7 h-7" />, step: '০২', title: 'অর্ডার করুন', desc: 'কার্টে যোগ করে ঠিকানা দিন। ক্যাশ অন ডেলিভারিতে পেমেন্ট', color: '#2563eb' },
              { icon: <Package className="w-7 h-7" />, step: '০৩', title: 'ডেলিভারি পান', desc: 'সারা বাংলাদেশে ডেলিভারি। পণ্য পেয়ে তারপর পেমেন্ট', color: '#7c3aed' },
              { icon: <Star className="w-7 h-7" />, step: '০৪', title: 'রিভিউ দিন', desc: 'আপনার অভিজ্ঞতা শেয়ার করুন এবং অন্যদের সাহায্য করুন', color: '#d97706' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border-2 border-stone-100 p-7 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                  <div>
                    <p className="text-xs font-bold mb-1 opacity-50" style={{ color: s.color }}>{s.step}</p>
                    <h3 className="font-bold text-stone-900 text-base mb-1">{s.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all group">
              বিস্তারিত গাইড <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ARTIST CTA ══ */}
      <section className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-full text-sm font-bold mb-8">
                <Palette className="w-4 h-4" /> শিল্পীদের জন্য
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">আপনি কি একজন<br /><span className="text-emerald-400">শিল্পী?</span></h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান। বিনামূল্যে যোগ দিন।</p>
              <div className="space-y-3 mb-10">
                {['বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', 'NID যাচাই করুন ও শিল্পকর্ম আপলোড করুন', 'অর্ডার পান, ঘরে বসে আয় করুন'].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600/25 border border-emerald-500/35 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <p className="text-stone-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>
              <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/30 group">
                আজই শুরু করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[['০%','লিস্টিং ফি'],['২৪/৭','কাস্টমার সাপোর্ট'],['১০০%','নিরাপদ লেনদেন'],['৫০০+','সক্রিয় শিল্পী']].map(([n,l]) => (
                <div key={l} className="bg-white/5 backdrop-blur p-8 rounded-3xl border border-white/10 text-center hover:bg-white/8 transition-all">
                  <h4 className="text-3xl font-bold text-white mb-1">{n}</h4>
                  <p className="text-stone-400 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">মতামত</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900">তারা কী বলছেন</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-stone-50 rounded-3xl border-2 border-stone-100 p-6 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />)}
                </div>
                {/* Quote mark */}
                <div className="text-5xl leading-none text-emerald-200 font-serif mb-2">"</div>
                <p className="text-stone-600 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar}`}
                    alt={t.name} className="w-10 h-10 rounded-full bg-stone-200" />
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{t.name}</p>
                    <p className="text-stone-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900">সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left gap-4">
                  <span className="font-bold text-stone-900 text-sm">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === i ? 'bg-emerald-600 text-white rotate-180' : 'bg-stone-100 text-stone-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 text-stone-500 text-sm border-t border-stone-100 pt-4 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
