import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowRight, Star, ShieldCheck, Truck,
  Heart, ChevronDown, Award, ChevronLeft, Package,
  ChevronRight as ChR, MapPin, Zap, Palette, Sparkles,
  Search, CheckCircle, MessageCircle, Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artwork, Artist } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

// ─── Warm color tokens ────────────────────────────────────────────────────────
const W = '#c2a06e';       // warm gold
const WD = '#1e1208';      // dark brown bg
const WL = '#faf6f0';      // cream bg

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&q=90&w=1600',
    tag: 'আরবি ক্যালিগ্রাফি',
    heading: 'শিল্পের ভাষায়',
    accent: 'হৃদয়ের কথা',
    sub: 'বাংলাদেশের সেরা ক্যালিগ্রাফি শিল্পীদের অনন্য সংগ্রহ',
  },
  {
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=90&w=1600',
    tag: 'পেইন্টিং',
    heading: 'রঙের মাধ্যমে',
    accent: 'জীবনের ছবি',
    sub: 'তেলরঙ, জলরঙ ও আক্রেলিকের অনন্য চিত্রকর্ম',
  },
  {
    image: 'https://images.unsplash.com/photo-1501084291732-13b1ba8f0ebc?auto=format&fit=crop&q=90&w=1600',
    tag: 'হস্তশিল্প',
    heading: 'হাতের ছোঁয়ায়',
    accent: 'অনন্য সৌন্দর্য',
    sub: 'দক্ষ কারিগরদের হাতে তৈরি শিল্পকর্ম',
  },
];

const FAQ_DATA = [
  { q: 'শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?', a: 'পছন্দের শিল্পকর্ম কার্টে যোগ করুন এবং অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারিতে পণ্য পেয়ে পেমেন্ট করুন।' },
  { q: 'ডেলিভারি চার্জ কত?', a: 'আমরা সারা বাংলাদেশে ডেলিভারি দিই। ডেলিভারি চার্জ অর্ডার করার সময় জানানো হবে।' },
  { q: 'আমি কি শিল্পী হিসেবে যোগ দিতে পারি?', a: 'হ্যাঁ! যেকোনো শিল্পী বিনামূল্যে আমাদের প্ল্যাটফর্মে যোগ দিতে পারেন। NID যাচাইয়ের পর শিল্পকর্ম আপলোড করা যাবে।' },
  { q: 'পেমেন্ট পদ্ধতি কী?', a: 'ক্যাশ অন ডেলিভারি — পণ্য পেয়ে সন্তুষ্ট হলে পেমেন্ট করুন। bKash, Nagad, Rocket ও ক্যাশ গ্রহণযোগ্য।' },
  { q: 'শিল্পকর্ম ফেরত দেওয়া যাবে?', a: 'হ্যাঁ, ক্ষতিগ্রস্ত পণ্য পেলে ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
];

// Artwork sections config — warm palette
const SECTIONS = [
  { bg: WL, border: '#e8d9c0', accent: '#8b6914', label: 'সম্প্রতি যুক্ত', num: '০১', grad: 'from-[#faf6f0] to-[#f5ead8]' },
  { bg: '#f9f3eb', border: '#d4b896', accent: '#7a4c0c', label: 'বিশেষ বাছাই', num: '০২', grad: 'from-[#f9f3eb] to-[#f0e0c8]' },
  { bg: '#fdf8f0', border: '#c8a06a', accent: '#5c3d12', label: 'ইসলামিক আর্ট', num: '০৩', grad: 'from-[#fdf8f0] to-[#f5e8d0]' },
  { bg: '#fefaf5', border: '#dfc9a0', accent: '#6b4c1a', label: 'চিত্রকলা', num: '০৪', grad: 'from-[#fefaf5] to-[#f8edd8]' },
  { bg: '#f7f0e8', border: '#bfa070', accent: '#4a3010', label: 'বিশেষ শিল্পকর্ম', num: '০৫', grad: 'from-[#f7f0e8] to-[#ecd9be]' },
];

// ─── Premium SVG Category Icons ──────────────────────────────────────────────
const CalligraphyIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <path d="M18 4 C12 4 7 9 7 15 C7 21 12 28 18 32 C24 28 29 21 29 15 C29 9 24 4 18 4Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3"/>
    <path d="M11 22 Q14 16 18 8" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M18 8 Q22 14 25 20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M13 18 Q18 14 23 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <circle cx="9" cy="24" r="2" fill={color} opacity="0.5"/>
    <circle cx="27" cy="22" r="1.5" fill={color} opacity="0.4"/>
  </svg>
);
const PaintingIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <rect x="4" y="5" width="22" height="26" rx="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08"/>
    <circle cx="10" cy="12" r="2.5" fill="#c2704a" opacity="0.8"/>
    <circle cx="17" cy="11" r="2.5" fill="#e8b840" opacity="0.85"/>
    <circle cx="10" cy="19" r="2.5" fill="#4a90c2" opacity="0.8"/>
    <circle cx="17" cy="19" r="2.5" fill={color} opacity="0.7"/>
    <path d="M29 8 Q32 12 30 17 Q28 22 30 27" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <ellipse cx="29" cy="6" rx="2" ry="3" fill={color} opacity="0.5" transform="rotate(-15 29 6)"/>
  </svg>
);
const DigitalIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <rect x="3" y="7" width="26" height="17" rx="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06"/>
    <path d="M11 30 L15 24 M25 30 L21 24" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 30 L27 30" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 18 L14 12 L18 16 L21 13 L26 18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="10" cy="18" r="1.5" fill={color} opacity="0.6"/>
    <circle cx="26" cy="18" r="1.5" fill={color} opacity="0.6"/>
  </svg>
);
const HandicraftIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <path d="M18 4 L21.5 14 L32 14 L23.5 20.5 L26.5 31 L18 24.5 L9.5 31 L12.5 20.5 L4 14 L14.5 14 Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" strokeLinejoin="round"/>
    <path d="M18 8 L20.5 15.5 L28 15.5 L22 19.5 L24 26.5 L18 22.5 L12 26.5 L14 19.5 L8 15.5 L15.5 15.5 Z" fill={color} opacity="0.45"/>
  </svg>
);
const SculptureIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <ellipse cx="18" cy="8" rx="6" ry="5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
    <path d="M12 13 Q10 20 11 28 L25 28 Q26 20 24 13" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08"/>
    <path d="M10 28 L26 28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 31 L28 31" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15 20 Q18 22 21 20" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);
const PhotographyIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
    <rect x="3" y="10" width="30" height="21" rx="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.07"/>
    <path d="M13 10 L15 5 L21 5 L23 10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    <circle cx="18" cy="20" r="6" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
    <circle cx="18" cy="20" r="3" fill={color} opacity="0.5"/>
    <circle cx="27" cy="14" r="2" fill={color} opacity="0.4"/>
  </svg>
);

const CAT_SVG: Record<string, (c: string) => React.ReactNode> = {
  'Arabic Calligraphy': (c) => <CalligraphyIcon color={c} />,
  'Painting': (c) => <PaintingIcon color={c} />,
  'Digital Art': (c) => <DigitalIcon color={c} />,
  'Handicraft': (c) => <HandicraftIcon color={c} />,
  'Sculpture': (c) => <SculptureIcon color={c} />,
  'Photography': (c) => <PhotographyIcon color={c} />,
};

const CATEGORIES = [
  { key: 'Arabic Calligraphy', label: 'ক্যালিগ্রাফি', desc: 'ইসলামিক আর্ট', color: '#8b6914', bg: '#fdf8f0', border: '#c8a06a' },
  { key: 'Painting', label: 'পেইন্টিং', desc: 'তেল ও জলরঙ', color: '#7a4c0c', bg: '#fef9f0', border: '#d4a06a' },
  { key: 'Digital Art', label: 'ডিজিটাল আর্ট', desc: 'ডিজিটাল মিডিয়া', color: '#5c3d12', bg: '#fdf5e8', border: '#c09060' },
  { key: 'Handicraft', label: 'হস্তশিল্প', desc: 'হাতে তৈরি', color: '#6b4c1a', bg: '#fef6e8', border: '#c8a870' },
  { key: 'Sculpture', label: 'ভাস্কর্য', desc: '৩ডি শিল্পকর্ম', color: '#4a3010', bg: '#fdf3e0', border: '#bfa070' },
  { key: 'Photography', label: 'ফটোগ্রাফি', desc: 'আলোকচিত্র', color: '#3d2810', bg: '#fdf1e0', border: '#b89060' },
];

// ─── Artwork card ─────────────────────────────────────────────────────────────
function ArtworkCard({ art, s }: { art: Artwork; s: typeof SECTIONS[0] }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(art.id);
  const inCart = isInCart(art.id);
  const disc = art.discount_percent ? Math.round(art.price * (1 - art.discount_percent / 100)) : null;

  return (
    <div className="group rounded-2xl overflow-hidden relative hover:-translate-y-1 transition-all duration-300"
      style={{ background: 'var(--card)', border: `1px solid ${s.border}`, boxShadow: '0 2px 12px rgba(139,105,20,0.06)' }}>
      {/* Image */}
      <Link to={`/artwork/${art.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'var(--bg)' }}>
        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {art.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-bold rounded-full shadow"
            style={{ background: `linear-gradient(135deg,${W},${s.accent})` }}>
            <Star className="w-2.5 h-2.5 fill-current" />ফিচারড
          </span>
        )}
        {art.discount_percent ? (
          <span className="absolute top-3 right-12 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">-{art.discount_percent}%</span>
        ) : null}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
          style={{ background: `linear-gradient(to top, rgba(30,18,8,0.72) 0%, transparent 60%)` }}>
          <span className="text-white font-bold text-xs">বিস্তারিত দেখুন →</span>
        </div>
        {/* Image-bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: s.border }} />
      </Link>
      {/* Wishlist btn */}
      <button onClick={e => { e.preventDefault(); toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ হয়েছে'); }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md z-10 transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-red-400'}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      {/* Info */}
      <div className="p-3 relative overflow-hidden">
        {/* Dot grid ornament — bottom-right, behind content */}
        <div className="absolute bottom-0 right-0 w-20 h-full pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${s.border} 1.5px, transparent 1.5px)`,
            backgroundSize: '8px 8px',
            backgroundPosition: 'right bottom',
            opacity: 0.45,
            maskImage: 'radial-gradient(ellipse 80% 100% at 100% 100%, black 40%, transparent 100%)'
          }} />
        {/* Content above ornament */}
        <div className="relative z-10">
          <Link to={`/artwork/${art.id}`}>
            <h3 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text)' }}>{art.title}</h3>
          </Link>
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text3)' }}>{art.artist?.full_name}</p>
          <div className="flex items-center justify-between mt-2.5 gap-1">
            <div className="min-w-0">
              {disc ? (
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: s.accent }}>৳{disc.toLocaleString()}</p>
                  <p className="text-[10px] line-through leading-tight" style={{ color: 'var(--text3)' }}>৳{art.price.toLocaleString()}</p>
                </div>
              ) : (
                <p className="font-bold text-sm" style={{ color: s.accent }}>৳{art.price.toLocaleString()}</p>
              )}
            </div>
            <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে! 🛒'); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 shadow-sm ${inCart ? 'border' : 'text-white'}`}
              style={inCart
                ? { background: 'rgba(194,160,110,0.12)', borderColor: s.accent, color: s.accent }
                : { background: `linear-gradient(135deg,${W},${s.accent})`, boxShadow: '0 2px 8px rgba(139,105,20,0.3)' }}>
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{inCart ? '✓' : 'কার্ট'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section header with corner ornament ────────────────────────────────────
function SectionHeader({ title, sub, link, s, idx }: { title: string; sub?: string; link: string; s: typeof SECTIONS[0]; idx: number }) {
  return (
    <div className="flex items-end justify-between mb-10 relative overflow-visible">
      {/* Big corner number decoration */}
      <div className="absolute -left-2 -top-10 pointer-events-none select-none" aria-hidden>
        <span className="text-[110px] font-black leading-none tracking-tighter"
          style={{ color: s.accent, opacity: 0.06, letterSpacing: '-0.04em' }}>{s.num}</span>
      </div>
      {/* Left side ornament line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ background: `linear-gradient(to bottom, ${W}, transparent)` }} />
      <div className="relative z-10 pl-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] mb-1" style={{ color: s.accent }}>{s.label}</p>
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: WD }}>{title}</h2>
        {sub && <p className="text-sm mt-1" style={{ color: '#9a7050' }}>{sub}</p>}
      </div>
      <Link to={link} className="relative z-10 flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-3"
        style={{ color: s.accent }}>
        সব দেখুন <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ArtSection({ title, sub, artworks, idx = 0 }: { title: string; sub?: string; artworks: Artwork[]; idx?: number }) {
  if (!artworks.length) return null;
  const s = SECTIONS[idx % SECTIONS.length];
  return (
    <section className={`py-16 bg-gradient-to-b ${s.grad}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} sub={sub} link="/marketplace" s={s} idx={idx} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {artworks.slice(0, 4).map(art => <ArtworkCard key={art.id} art={art} s={s} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Main Home ────────────────────────────────────────────────────────────────
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
    if (!paused) timer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
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
    <div style={{ background: WL }}>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh', background: WD }}>
        <AnimatePresence mode="wait">
          <motion.div key={slide} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }} className="absolute inset-0">
            <img src={cur.image} alt="" className="w-full h-full object-cover" style={{ minHeight: '100vh' }}
              onError={(e: any) => { e.target.style.display = 'none'; }} />
            {/* Deep warm overlay */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(110deg, rgba(30,18,8,0.88) 0%, rgba(30,18,8,0.60) 45%, rgba(30,18,8,0.25) 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(30,18,8,0.65) 0%, transparent 55%)' }} />
            {/* Warm golden vignette */}
            <div className="absolute top-0 left-0 w-1/2 h-full"
              style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(194,160,110,0.08) 0%, transparent 60%)' }} />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 w-full flex items-center" style={{ minHeight: '100vh' }}>
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl py-32">

              {/* Tag pill */}
              <motion.span initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{ background: 'rgba(194,160,110,0.18)', borderColor: 'rgba(194,160,110,0.5)', color: '#e8c880' }}>
                <Sparkles className="w-3.5 h-3.5" />{cur.tag}
              </motion.span>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.06] mb-5 tracking-tight">
                {cur.heading}<br />
                <span style={{ color: W }}>{cur.accent}</span>
              </h1>

              {/* Decorative underline */}
              <div className="w-20 h-1 rounded-full mb-6" style={{ background: `linear-gradient(to right, ${W}, transparent)` }} />

              <p className="text-stone-300 text-lg leading-relaxed mb-10 max-w-lg">{cur.sub}</p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link to="/marketplace"
                  className="group px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-2xl"
                  style={{ background: `linear-gradient(135deg,${W},#8b6914)`, boxShadow: '0 8px 30px rgba(194,160,110,0.4)' }}>
                  মার্কেটপ্লেস দেখুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 transition-all"
                  style={{ borderColor: 'rgba(194,160,110,0.3)' }}>
                  শিল্পী হিসেবে যোগ দিন
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-8 border-t border-white/12">
                {[['৫০০+', 'শিল্পী'], ['২৫০০+', 'শিল্পকর্ম'], ['৬৪', 'জেলায় ডেলিভারি'], ['৫কে+', 'সন্তুষ্ট ক্রেতা']].map(([n, l]) => (
                  <div key={l}><p className="text-xl font-bold text-white">{n}</p><p className="text-xs" style={{ color: '#9a8070' }}>{l}</p></div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide controls */}
        {([[-1, ChevronLeft, 'left-5'], [1, ChR, 'right-5']] as const).map(([dir, Icon, cls], idx) => (
          <button key={idx} onClick={() => goTo((slide + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className={`absolute ${cls} top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border text-white flex items-center justify-center hover:scale-110 transition-all backdrop-blur-sm`}
            style={{ background: 'rgba(30,18,8,0.5)', borderColor: 'rgba(194,160,110,0.3)' }}>
            <Icon className="w-5 h-5" />
          </button>
        ))}

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="h-2 rounded-full transition-all"
              style={{ width: i === slide ? '28px' : '8px', background: i === slide ? W : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>

        {/* Thumbnail nav */}
        <div className="absolute bottom-6 right-6 z-30 hidden lg:flex gap-2.5">
          {HERO_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`w-16 h-10 rounded-xl overflow-hidden transition-all ${i === slide ? 'scale-110 shadow-lg' : 'opacity-60 hover:opacity-90'}`}
              style={{ border: `2px solid ${i === slide ? W : 'rgba(255,255,255,0.2)'}` }}>
              <img src={s.image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <div className="py-5 border-y" style={{ background: WD, borderColor: 'rgba(194,160,110,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-semibold">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: '১০০% অরিজিনাল', c: W },
              { icon: <Truck className="w-4 h-4" />, text: 'পুরো দেশে ডেলিভারি', c: '#90c0a0' },
              { icon: <Award className="w-4 h-4" />, text: 'Verified শিল্পী', c: '#e8c880' },
              { icon: <Zap className="w-4 h-4" />, text: '৭ দিন রিটার্ন', c: '#e08080' },
              { icon: <MessageCircle className="w-4 h-4" />, text: '২৪/৭ সাপোর্ট', c: '#a0b0e0' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2" style={{ color: f.c }}>
                {f.icon}<span className="text-stone-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="py-16" style={{ background: WL }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: W }}>বিভাগ</p>
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: WD }}>শিল্পের ধরন বেছে নিন</h2>
            <p className="text-sm mt-2" style={{ color: '#9a7050' }}>বাংলাদেশের সেরা শিল্পীদের বিভিন্ন ধরনের শিল্পকর্ম</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.key} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/marketplace?category=${cat.key}`}
                  className="group flex flex-col items-center p-4 sm:p-5 rounded-3xl border-2 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  style={{ background: cat.bg, borderColor: cat.border }}>
                  {/* Corner glow */}
                  <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at 100% 0%, ${cat.color}20, transparent 70%)` }} />
                  <div className="mb-2 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {CAT_SVG[cat.key]?.(cat.color)}
                  </div>
                  <h3 className="relative z-10 font-bold text-xs sm:text-sm text-center leading-tight" style={{ color: cat.color }}>{cat.label}</h3>
                  <p className="relative z-10 text-[10px] mt-0.5 opacity-60 text-center" style={{ color: cat.color }}>{cat.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ARTWORK SECTIONS ══ */}
      <ArtSection title="নতুন শিল্পকর্ম" sub="সম্প্রতি আপলোড করা অনন্য শিল্পকর্ম" artworks={newArt} idx={0} />
      <ArtSection title="নির্বাচিত শিল্পকর্ম" sub="বিশেষভাবে কিউরেটেড সংগ্রহ" artworks={featuredArt} idx={1} />
      <ArtSection title="আরবি ক্যালিগ্রাফি" sub="ঐতিহ্যবাহী ইসলামিক শিল্পকলা" artworks={calligraphyArt} idx={2} />
      <ArtSection title="পেইন্টিং" sub="তেলরঙ, জলরঙ ও আক্রেলিকের শিল্পকর্ম" artworks={paintingArt} idx={3} />
      <ArtSection title="হস্তশিল্প" sub="দক্ষ কারিগরদের হাতে তৈরি" artworks={handmadeArt} idx={4} />

      {/* ══ FEATURED ARTISTS ══ */}
      {featuredArtists.length > 0 && (
        <section className="py-20" style={{ background: '#f5ead8' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: W }}>শিল্পীগণ</p>
                <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: WD }}>Verified <span style={{ color: W }}>শিল্পীরা</span></h2>
                <p className="text-sm mt-1" style={{ color: '#9a7050' }}>দেশের সেরা যাচাইকৃত শিল্পীদের সাথে পরিচিত হন</p>
              </div>
              <Link to="/artists" className="flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all" style={{ color: W }}>
                সব শিল্পী <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredArtists.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/artist/${a.id}`}
                    className="block border-2 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group text-center"
                    style={{ background: WL, borderColor: '#e8d9c0' }}>
                    <div className="pt-6 pb-3 px-3 flex flex-col items-center"
                      style={{ background: 'linear-gradient(180deg, #fdf6ec 0%, #faf6f0 70%)' }}>
                      <div className="relative mb-3">
                        <img src={a.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}`}
                          alt={a.full_name} className="w-18 h-18 rounded-full object-cover border-4 border-white shadow-md" style={{ width: '72px', height: '72px' }} />
                        {a.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow"
                            style={{ background: W }}>
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xs leading-tight" style={{ color: WD }}>{a.full_name}</h3>
                      {a.district && <p className="text-[10px] mt-0.5 flex items-center gap-0.5" style={{ color: '#9a7050' }}><MapPin className="w-2.5 h-2.5" />{a.district}</p>}
                    </div>
                    <div className="flex items-center justify-center gap-3 px-3 py-3 border-t" style={{ borderColor: '#e8d9c0' }}>
                      <div><p className="font-bold text-xs" style={{ color: WD }}>{a.total_sales}</p><p className="text-[9px]" style={{ color: '#9a7050' }}>বিক্রয়</p></div>
                      <div className="w-px h-4" style={{ background: '#e8d9c0' }} />
                      <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-current" style={{ color: W }} /><p className="font-bold text-xs" style={{ color: WD }}>{(a.rating_avg || 0).toFixed(1)}</p></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-20 relative overflow-hidden" style={{ background: WD }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(194,160,110,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: W }}>গাইড</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">কীভাবে ব্যবহার করবেন?</h2>
            <p className="text-stone-400">মাত্র কয়েকটি ধাপে কেনাকাটা বা বিক্রি শুরু করুন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { icon: <Search className="w-7 h-7" />, step: '০১', title: 'খুঁজুন', desc: 'ক্যাটাগরি বা শিল্পী নাম দিয়ে পছন্দের শিল্পকর্ম খুঁজুন' },
              { icon: <ShoppingBag className="w-7 h-7" />, step: '০২', title: 'অর্ডার করুন', desc: 'কার্টে যোগ করে ঠিকানা দিন। ক্যাশ অন ডেলিভারিতে পেমেন্ট' },
              { icon: <Package className="w-7 h-7" />, step: '০৩', title: 'ডেলিভারি পান', desc: 'সারা বাংলাদেশে ডেলিভারি। পণ্য পেয়ে তারপর পেমেন্ট' },
              { icon: <Star className="w-7 h-7" />, step: '০৪', title: 'রিভিউ দিন', desc: 'আপনার অভিজ্ঞতা শেয়ার করুন এবং অন্যদের সাহায্য করুন' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-3xl border p-6 hover:-translate-y-1 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(194,160,110,0.2)' }}>
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: 'rgba(194,160,110,0.15)', color: W, width: '52px', height: '52px' }}>
                  {s.icon}
                </div>
                <p className="text-xs font-bold mb-1" style={{ color: W, opacity: 0.6 }}>{s.step}</p>
                <h3 className="font-bold text-white text-base mb-1">{s.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-7 py-3.5 text-white rounded-2xl font-bold transition-all group"
              style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
              বিস্তারিত গাইড <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ARTIST CTA ══ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#f0e4d0' }}>
        {/* Decorative SVG pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='1' fill='%23c2a06e' opacity='0.5'/%3E%3C/svg%3E")` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 border"
                style={{ background: 'rgba(194,160,110,0.15)', borderColor: 'rgba(194,160,110,0.4)', color: '#8b6914' }}>
                <Palette className="w-4 h-4" />শিল্পীদের জন্য
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight" style={{ color: WD }}>
                আপনি কি একজন<br /><span style={{ color: W }}>শিল্পী?</span>
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#6b4c1a' }}>হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান। বিনামূল্যে যোগ দিন।</p>
              <div className="space-y-3 mb-10">
                {['বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', 'NID যাচাই করুন ও শিল্পকর্ম আপলোড করুন', 'অর্ডার পান, ঘরে বসে আয় করুন'].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 text-white"
                      style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>{i + 1}</div>
                    <p className="text-sm" style={{ color: '#5c3d12' }}>{s}</p>
                  </div>
                ))}
              </div>
              <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-bold transition-all shadow-xl group"
                style={{ background: `linear-gradient(135deg,${W},#8b6914)`, boxShadow: '0 8px 30px rgba(139,105,20,0.35)' }}>
                আজই শুরু করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[['০%', 'লিস্টিং ফি'], ['২৪/৭', 'কাস্টমার সাপোর্ট'], ['১০০%', 'নিরাপদ লেনদেন'], ['৫০০+', 'সক্রিয় শিল্পী']].map(([n, l]) => (
                <div key={l} className="p-8 rounded-3xl border text-center hover:-translate-y-1 transition-all"
                  style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#e0c890', backdropFilter: 'blur(8px)' }}>
                  <h4 className="text-3xl font-bold mb-1" style={{ color: WD }}>{n}</h4>
                  <p className="text-sm" style={{ color: '#8b6914' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-20" style={{ background: '#f5ead8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: W }}>মতামত</p>
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: WD }}>তারা কী বলছেন</h2>
            <p className="text-sm mt-2" style={{ color: '#9a7050' }}>আমাদের সন্তুষ্ট ক্রেতা ও শিল্পীদের অভিজ্ঞতা</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'ফারহান আহমেদ', city: 'ঢাকা', rating: 5, text: 'অসাধারণ একটি প্ল্যাটফর্ম! ড্রয়িং রুমের জন্য একটি ক্যালিগ্রাফি কিনেছি — মানের দিক থেকে অতুলনীয়।', avatar: 'farhan' },
              { name: 'নাজমুন নাহার', city: 'চট্টগ্রাম', rating: 5, text: 'আমি শিল্পী হিসেবে যোগ দিয়েছি। মাত্র দুই সপ্তাহে তিনটি অর্ডার পেয়েছি। এডমিন খুব দ্রুত সাড়া দেন।', avatar: 'najma' },
              { name: 'রাকিব হোসেন', city: 'রাজশাহী', rating: 5, text: 'শিল্পশপ শিল্পপ্রেমীদের জন্য স্বর্গ। দেশের বিভিন্ন প্রান্তের শিল্পীদের কাজ একটি জায়গায় — অসাধারণ।', avatar: 'rakib' },
              { name: 'সুমাইয়া ইসলাম', city: 'সিলেট', rating: 5, text: 'অর্ডার দেওয়া থেকে ডেলিভারি পর্যন্ত পুরো অভিজ্ঞতা দুর্দান্ত। শিল্পকর্মের মান প্রত্যাশার চেয়ে বেশি ভালো।', avatar: 'sumaiya' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-3xl border-2 p-6 hover:-translate-y-1 hover:shadow-xl transition-all"
                style={{ background: WL, borderColor: '#e8d9c0' }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" style={{ color: W }} />)}
                </div>
                <div className="text-5xl leading-none font-serif mb-1" style={{ color: '#e8c898', fontFamily: 'Georgia,serif' }}>"</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b4c1a' }}>{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: '#e8d9c0' }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar}`}
                    alt={t.name} className="w-10 h-10 rounded-full" style={{ background: '#f5ead8' }} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: WD }}>{t.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: '#9a7050' }}>
                      <MapPin className="w-3 h-3" />{t.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-20" style={{ background: 'var(--bg)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: W }}>FAQ</p>
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: 'var(--text)' }}>সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left gap-4">
                  <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ background: openFaq === i ? W : 'var(--bg)', color: openFaq === i ? 'white' : W }}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 text-sm pt-4 leading-relaxed border-t" style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}>{faq.a}</div>
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
