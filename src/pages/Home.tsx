import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowRight, Star, ShieldCheck, Truck, Palette,
  Heart, ChevronDown, Award, Sparkles, ChevronLeft,
  ChevronRight as ChevronRightIcon, MapPin, Zap, Package, Users
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
    heading: 'শিল্পের মাধ্যমে',
    highlight: 'আত্মার কথা বলুন',
    sub: 'বাংলাদেশের সেরা ক্যালিগ্রাফি শিল্পীদের অনন্য কাজ'
  },
  {
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=90&w=1600',
    tag: 'পেইন্টিং',
    heading: 'রঙে আঁকা',
    highlight: 'জীবনের গল্প',
    sub: 'তেলরঙ, জলরঙ ও আক্রেলিকের মনোমুগ্ধকর সংগ্রহ'
  },
  {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=90&w=1600',
    tag: 'হস্তশিল্প',
    heading: 'হাতের ছোঁয়ায়',
    highlight: 'অনন্য সৌন্দর্য',
    sub: 'দক্ষ শিল্পীদের হাতে তৈরি একেবারে আলাদা শিল্পকর্ম'
  },
];

const CATEGORIES = [
  { key: 'Arabic Calligraphy', label: 'আরবি ক্যালিগ্রাফি', icon: '✍️', color: '#f59e0b' },
  { key: 'Painting', label: 'পেইন্টিং', icon: '🎨', color: '#3b82f6' },
  { key: 'Watercolor', label: 'জলরঙ', icon: '🖌️', color: '#06b6d4' },
  { key: 'Digital Art', label: 'ডিজিটাল আর্ট', icon: '💻', color: '#8b5cf6' },
  { key: 'Handicraft', label: 'হস্তশিল্প', icon: '🏺', color: '#10b981' },
  { key: 'Sketch', label: 'স্কেচ', icon: '✏️', color: '#f97316' },
];

const FAQ_DATA = [
  { q: 'শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?', a: 'পছন্দের শিল্পকর্ম কার্টে যোগ করুন এবং অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারিতে পেমেন্ট করুন।' },
  { q: 'ডেলিভারি চার্জ কত?', a: 'আমরা বর্তমানে সারা বাংলাদেশে বিনামূল্যে ডেলিভারি দিচ্ছি।' },
  { q: 'আমি কি শিল্পী হিসেবে যোগ দিতে পারি?', a: 'হ্যাঁ! যেকোনো শিল্পী বিনামূল্যে আমাদের প্ল্যাটফর্মে যোগ দিতে পারেন এবং শিল্পকর্ম বিক্রি করতে পারেন।' },
  { q: 'পেমেন্ট পদ্ধতি কী?', a: 'আমরা ক্যাশ অন ডেলিভারি সমর্থন করি। পণ্য পেয়ে সন্তুষ্ট হলে পেমেন্ট করুন।' },
  { q: 'শিল্পকর্ম ফেরত দেওয়া যাবে কি?', a: 'হ্যাঁ, ক্ষতিগ্রস্ত বা ভুল পণ্য পেলে ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
];

function ArtworkCard({ art }: { art: Artwork }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(art.id);
  const inCart = isInCart(art.id);
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 relative">
      <Link to={`/artwork/${art.id}`} className="block relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {art.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
            <Star className="w-3 h-3 fill-current" /> ফিচারড
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>
      <button
        onClick={e => { e.preventDefault(); toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ'); }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-400'}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="p-4">
        <Link to={`/artwork/${art.id}`}>
          <h3 className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3>
        </Link>
        <p className="text-stone-400 text-xs mt-0.5">{art.artist?.full_name}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="font-bold text-stone-900 text-base">৳{art.price.toLocaleString()}</p>
            <p className="text-emerald-600 text-xs font-medium">ফ্রি ডেলিভারি</p>
          </div>
          <button
            onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে! 🛒'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${inCart ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {inCart ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, sub, artworks, bg = '' }: { title: string; sub?: string; artworks: Artwork[]; bg?: string }) {
  if (!artworks.length) return null;
  return (
    <section className={`py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">{title}</h2>
            {sub && <p className="text-stone-400 text-sm mt-1">{sub}</p>}
          </div>
          <Link to="/marketplace" className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm hover:gap-2.5 transition-all">
            সব দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {artworks.slice(0, 4).map(art => <ArtworkCard key={art.id} art={art} />)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featuredArt, setFeaturedArt] = useState<Artwork[]>([]);
  const [calligraphyArt, setCalligraphyArt] = useState<Artwork[]>([]);
  const [paintingArt, setPaintingArt] = useState<Artwork[]>([]);
  const [handmadeArt, setHandmadeArt] = useState<Artwork[]>([]);
  const [newArt, setNewArt] = useState<Artwork[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    timer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    const go = async () => {
      const [{ data: feat }, { data: cal }, { data: paint }, { data: hand }, { data: newArts }, { data: arts }] = await Promise.all([
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('is_featured', true).limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Arabic Calligraphy').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Painting').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Handicraft').limit(4),
        supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
        supabase.from('artists').select('*').eq('is_verified', true).eq('is_active', true).order('total_sales', { ascending: false }).limit(6),
      ]);
      setFeaturedArt(feat || []); setCalligraphyArt(cal || []); setPaintingArt(paint || []);
      setHandmadeArt(hand || []); setNewArt(newArts || []); setFeaturedArtists(arts || []);
    };
    go();
  }, []);

  const goNext = () => { setSlide(s => (s + 1) % HERO_SLIDES.length); clearInterval(timer.current); };
  const goPrev = () => { setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); clearInterval(timer.current); };

  const cur = HERO_SLIDES[slide];

  return (
    <div className="bg-white">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-stone-900">

        {/* Background slideshow */}
        <AnimatePresence mode="wait">
          <motion.div key={slide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }} className="absolute inset-0">
            <img src={cur.image} alt="" className="w-full h-full object-cover" />
            {/* Overlay: strong left gradient so text is always readable */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)'
            }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)'
            }} />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-28">
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
              className="max-w-xl">

              {/* Slide tag */}
              <span className="inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-bold uppercase tracking-widest border"
                style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.5)', color: '#6ee7b7' }}>
                {cur.tag}
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6">
                {cur.heading}<br />
                <span className="text-emerald-400">{cur.highlight}</span>
              </h1>

              <p className="text-stone-300 text-lg leading-relaxed mb-10">{cur.sub}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/marketplace"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all shadow-lg shadow-emerald-900/30">
                  মার্কেটপ্লেস দেখুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/25 hover:border-white/50 hover:bg-white/10 transition-all">
                  শিল্পী হিসেবে যোগ দিন
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-14 flex flex-wrap gap-8 pt-10 border-t border-white/15">
                {[['৫০০+','শিল্পী'], ['২৫০০+','শিল্পকর্ম'], ['৬৪','জেলায় ডেলিভারি'], ['৫কে+','সন্তুষ্ট ক্রেতা']].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-bold text-white">{n}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow buttons */}
        <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/50 transition-all backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/50 transition-all backdrop-blur-sm">
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className="h-2 rounded-full transition-all"
              style={{ width: i === slide ? '28px' : '8px', background: i === slide ? '#10b981' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
      </section>

      {/* ════════════════ TRUST BAR ════════════════ */}
      <section className="bg-emerald-600 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-white text-sm font-semibold">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: '১০০% অরিজিনাল শিল্পকর্ম' },
              { icon: <Truck className="w-4 h-4" />, text: 'সারা দেশে ফ্রি ডেলিভারি' },
              { icon: <Package className="w-4 h-4" />, text: 'সহজ রিটার্ন পলিসি' },
              { icon: <Award className="w-4 h-4" />, text: 'যাচাইকৃত শিল্পী' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 opacity-90">
                {f.icon} {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CATEGORIES ════════════════ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">ক্যাটাগরি</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">ধরন অনুযায়ী ব্রাউজ করুন</h2>
            <p className="text-stone-400 mt-2">আপনার পছন্দের শিল্পের ধরন বেছে নিন</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/marketplace?category=${cat.key}`}
                  className="group flex flex-col items-center p-5 bg-white rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <span className="text-4xl mb-3">{cat.icon}</span>
                  <h3 className="font-bold text-stone-800 text-xs text-center group-hover:text-emerald-700 transition-colors leading-tight">{cat.label}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ ARTWORK SECTIONS ════════════════ */}
      <Section title="নতুন শিল্পকর্ম" sub="সম্প্রতি যোগ হওয়া অনন্য কাজ" artworks={newArt} />
      <Section title="নির্বাচিত শিল্পকর্ম" sub="আমাদের বিশেষ বাছাই" artworks={featuredArt} bg="bg-stone-50" />
      <Section title="আরবি ক্যালিগ্রাফি" sub="ইসলামিক শিল্পকলার অনন্য সংগ্রহ" artworks={calligraphyArt} />
      <Section title="পেইন্টিং" sub="দেশের সেরা চিত্রশিল্পীদের কাজ" artworks={paintingArt} bg="bg-stone-50" />
      <Section title="হস্তশিল্প" sub="হাতে তৈরি অনন্য শিল্পকর্ম" artworks={handmadeArt} />

      {/* ════════════════ FEATURED ARTISTS ════════════════ */}
      {featuredArtists.length > 0 && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">শিল্পীগণ</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">যাচাইকৃত <span className="text-emerald-600">শিল্পীরা</span></h2>
                <p className="text-stone-400 mt-2 text-sm">সেরা ও বিশ্বস্ত শিল্পীদের সাথে পরিচিত হন</p>
              </div>
              <Link to="/artists" className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all">
                সব শিল্পী <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredArtists.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/artist/${a.id}`}
                    className="block bg-white rounded-2xl border border-stone-100 hover:border-emerald-200 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group text-center">
                    <div className="relative h-24 bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center">
                      <img src={a.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}`}
                        alt={a.full_name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" />
                      {a.is_verified && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-stone-900 text-xs group-hover:text-emerald-600 transition-colors leading-tight">{a.full_name}</h3>
                      {a.district && <p className="text-stone-400 text-[10px] mt-0.5">{a.district}</p>}
                      <p className="text-emerald-600 text-[10px] font-bold mt-1">{a.total_sales} বিক্রয়</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ ARTIST CTA ════════════════ */}
      <section className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm font-bold mb-8">
                <Palette className="w-4 h-4" /> শিল্পীদের জন্য সুযোগ
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                আপনি কি একজন<br /><span className="text-emerald-400">শিল্পী?</span>
              </h2>
              <p className="text-stone-400 text-lg mb-10 leading-relaxed">
                হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান। বিনামূল্যে যোগ দিন এবং আপনার শিল্পকর্ম বিক্রি শুরু করুন।
              </p>
              <div className="space-y-3 mb-10">
                {['বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', 'NID যাচাই করুন ও শিল্পকর্ম আপলোড করুন', 'অর্ডার পান এবং ঘরে বসে আয় করুন'].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-stone-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-900/30 group">
                আজই শুরু করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[['০%', 'লিস্টিং ফি'], ['২৪/৭', 'কাস্টমার সাপোর্ট'], ['১০০%', 'নিরাপদ পেমেন্ট'], ['৫০০+', 'সক্রিয় শিল্পী']].map(([n, l]) => (
                <div key={l} className="bg-white/5 backdrop-blur p-8 rounded-3xl border border-white/10 text-center">
                  <h4 className="text-3xl font-bold text-white mb-1">{n}</h4>
                  <p className="text-stone-400 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left gap-4">
                  <span className="font-bold text-stone-900 text-sm">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === i ? 'bg-emerald-600 text-white rotate-180' : 'bg-white border border-stone-200 text-stone-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 text-stone-500 text-sm leading-relaxed border-t border-stone-100 pt-4">{faq.a}</div>
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
