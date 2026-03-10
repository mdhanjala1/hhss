import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowRight, Star, ShieldCheck, Truck, Palette,
  Heart, ChevronDown, Award, Sparkles, ChevronLeft,
  ChevronRight as ChevronRightIcon, MapPin, Zap, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artwork, Artist } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

const HERO_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1400', caption: 'অনন্য চিত্রকলা' },
  { image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1400', caption: 'আরবি ক্যালিগ্রাফি' },
  { image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=1400', caption: 'হাতে তৈরি শিল্প' },
];

const CATEGORIES = [
  { key: 'Arabic Calligraphy', label: 'আরবি ক্যালিগ্রাফি', icon: '✍️', desc: 'ইসলামিক শিল্পকলার অনন্য রূপ' },
  { key: 'Painting', label: 'পেইন্টিং', icon: '🎨', desc: 'তেলরঙ, জলরঙ ও আরো অনেক কিছু' },
  { key: 'Digital Art', label: 'ডিজিটাল আর্ট', icon: '💻', desc: 'আধুনিক ডিজিটাল শিল্পকর্ম' },
  { key: 'Handicraft', label: 'হস্তশিল্প', icon: '🏺', desc: 'ঘর সাজানোর অনন্য টুকরো' },
  { key: 'Watercolor', label: 'জলরঙ', icon: '🖌️', desc: 'স্নিগ্ধ জলরঙের শিল্প' },
  { key: 'Sketch', label: 'স্কেচ', icon: '✏️', desc: 'দক্ষ হাতের রেখাচিত্র' },
];

const FAQ_DATA = [
  { q: 'শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?', a: 'পছন্দের শিল্পকর্মটি নির্বাচন করে কার্টে যোগ করুন বা সরাসরি অর্ডার করুন। ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন হবে।' },
  { q: 'ডেলিভারি চার্জ কত?', a: 'আমরা বর্তমানে সারা বাংলাদেশে ফ্রি ডেলিভারি দিচ্ছি।' },
  { q: 'আমি কি শিল্পী হিসেবে যোগ দিতে পারি?', a: 'হ্যাঁ! যেকোনো শিল্পী আমাদের প্ল্যাটফর্মে বিনামূল্যে যোগ দিতে পারেন। শিল্পী হিসেবে যোগ দিন বাটনে ক্লিক করুন।' },
  { q: 'পেমেন্ট পদ্ধতি কী?', a: 'আমরা ক্যাশ অন ডেলিভারি সমর্থন করি। পণ্য পেয়ে সন্তুষ্ট হলে তারপর পেমেন্ট করুন।' },
  { q: 'শিল্পকর্ম ফেরত দেওয়া যাবে কি?', a: 'হ্যাঁ, পণ্য ক্ষতিগ্রস্ত অবস্থায় পেলে ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
];

function ArtworkCard({ art }: { art: Artwork }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(art.id);
  const inCart = isInCart(art.id);

  return (
    <div className="art-card group bg-white rounded-3xl overflow-hidden border border-stone-200/60 relative">
      <Link to={`/artwork/${art.id}`} className="block relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img src={art.image_url} alt={art.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
          style={{ '--tw-scale-x': '1', '--tw-scale-y': '1' } as any} />
        {art.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-bold rounded-full"
            style={{ background: 'linear-gradient(135deg,#b5944a,#d4b06a)' }}>
            <Star className="w-3 h-3 fill-current" />ফিচারড
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <button onClick={e => { e.preventDefault(); toggle(art); toast.success(wishlisted ? 'সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ'); }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-400 hover:text-red-500'}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="p-4">
        <Link to={`/artwork/${art.id}`}>
          <h3 className="font-bold text-stone-900 text-sm hover:text-[#b5944a] transition-colors line-clamp-1 font-display">{art.title}</h3>
        </Link>
        <p className="text-stone-400 text-xs mt-0.5">{art.artist?.full_name}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
            <p className="text-xs font-medium" style={{ color: '#b5944a' }}>ফ্রি ডেলিভারি</p>
          </div>
          <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে! 🛒'); }}
            className={`flex items-center gap-1 px-3 py-2 rounded-2xl font-bold text-xs transition-all ${
              inCart ? 'bg-stone-100 text-stone-600 border border-stone-200' : 'text-white shadow-sm'
            }`}
            style={!inCart ? { background: 'linear-gradient(135deg,#b5944a,#d4b06a)' } : {}}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {inCart ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArtSection({ title, subtitle, artworks }: { title: string; subtitle?: string; artworks: Artwork[] }) {
  if (!artworks.length) return null;
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900">{title}</h2>
            {subtitle && <p className="text-stone-400 mt-1 text-sm">{subtitle}</p>}
          </div>
          <Link to="/marketplace" className="flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all" style={{ color: '#b5944a' }}>
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
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    timer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: feat }, { data: cal }, { data: paint }, { data: hand }, { data: newArts }, { data: artsts }] = await Promise.all([
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('is_featured', true).limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Arabic Calligraphy').limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Painting').limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Handicraft').limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
      supabase.from('artists').select('*').eq('is_verified', true).eq('is_active', true).order('total_sales', { ascending: false }).limit(6),
    ]);
    setFeaturedArt(feat || []); setCalligraphyArt(cal || []); setPaintingArt(paint || []);
    setHandmadeArt(hand || []); setNewArt(newArts || []); setFeaturedArtists(artsts || []);
    setLoading(false);
  };

  return (
    <div style={{ background: '#faf8f4' }}>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img key={slide} src={HERO_SLIDES[slide].image} alt=""
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }} className="w-full h-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(10,7,2,0.85) 0%, rgba(10,7,2,0.55) 50%, rgba(10,7,2,0.2) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,7,2,0.5) 0%, transparent 60%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-32">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border text-sm font-medium"
              style={{ background: 'rgba(181,148,74,0.15)', borderColor: 'rgba(181,148,74,0.4)', color: '#d4b06a' }}>
              <Sparkles className="w-4 h-4" />
              বাংলাদেশের ১ নম্বর আর্ট মার্কেটপ্লেস
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] mb-6">
              সৃজনশীলতার<br />
              <em className="not-italic" style={{ color: '#d4b06a' }}>নতুন দিগন্ত</em>
            </h1>
            <p className="text-stone-300 text-lg mb-10 leading-relaxed max-w-xl">
              দেশের সেরা শিল্পীদের হাতে তৈরি অনন্য শিল্পকর্ম। আপনার ঘর সাজান অকৃত্রিম সৌন্দর্যে।
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace"
                className="px-8 py-4 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 group"
                style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)', boxShadow: '0 8px 30px rgba(181,148,74,0.35)' }}>
                মার্কেটপ্লেস দেখুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="px-8 py-4 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                শিল্পী হিসেবে যোগ দিন
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex items-center gap-8 pt-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              {[['৫০০+','শিল্পী'], ['২.৫হাজার+','শিল্পকর্ম'], ['৬৪','জেলায় ডেলিভারি']].map(([n, l], i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />}
                  <div>
                    <p className="text-2xl font-display font-bold" style={{ color: '#d4b06a' }}>{n}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{l}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Slider controls */}
        {[
          { pos: 'left-4', icon: <ChevronLeft className="w-5 h-5" />, fn: () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length) },
          { pos: 'right-4', icon: <ChevronRightIcon className="w-5 h-5" />, fn: () => setSlide(s => (s + 1) % HERO_SLIDES.length) },
        ].map(({ pos, icon, fn }, i) => (
          <button key={i} onClick={() => { fn(); clearInterval(timer.current); }}
            className={`absolute ${pos} top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all border`}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(181,148,74,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
            {icon}
          </button>
        ))}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ background: i === slide ? '#d4b06a' : 'rgba(255,255,255,0.3)', width: i === slide ? '32px' : '8px' }} />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#b5944a' }}>ক্যাটাগরি</p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-stone-900 mb-3">ধরন অনুযায়ী ব্রাউজ করুন</h2>
            <p className="text-stone-400">আপনার পছন্দের শিল্পের ধরন বেছে নিন</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/marketplace?category=${cat.key}`}
                  className="group block bg-stone-50 border border-stone-100 rounded-3xl p-5 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(181,148,74,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(181,148,74,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.background = ''; }}>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-bold text-stone-900 text-xs group-hover:text-[#b5944a] transition-colors">{cat.label}</h3>
                  <p className="text-stone-400 text-[10px] mt-1 line-clamp-2">{cat.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14" style={{ background: '#1a1208' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: 'নিরাপদ লেনদেন', desc: 'প্রতিটি অর্ডার তদারকি করা হয়' },
              { icon: <Award className="w-6 h-6" />, title: 'অকৃত্রিম শিল্প', desc: '১০০% অরিজিনাল হাতে তৈরি' },
              { icon: <Truck className="w-6 h-6" />, title: 'ফ্রি ডেলিভারি', desc: 'সারা বাংলাদেশে পৌঁছে দেই' },
              { icon: <Zap className="w-6 h-6" />, title: 'সহজ রিটার্ন', desc: 'সন্তুষ্ট না হলে ফেরত দিন' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl border"
                style={{ background: 'rgba(181,148,74,0.07)', borderColor: 'rgba(181,148,74,0.2)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(181,148,74,0.2)', color: '#d4b06a' }}>{f.icon}</div>
                <div>
                  <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  <p className="text-stone-500 text-xs mt-1">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTWORKS ── */}
      <ArtSection title="নতুন শিল্পকর্ম" subtitle="সম্প্রতি যোগ হওয়া অনন্য শিল্পকর্ম" artworks={newArt} />
      <div className="bg-white">
        <ArtSection title="নির্বাচিত শিল্পকর্ম" subtitle="আমাদের বিশেষ বাছাই" artworks={featuredArt} />
      </div>
      <ArtSection title="আরবি ক্যালিগ্রাফি" subtitle="ইসলামিক শিল্পকলার অনন্য সংগ্রহ" artworks={calligraphyArt} />
      <div className="bg-white">
        <ArtSection title="পেইন্টিং" subtitle="দেশের সেরা চিত্রশিল্পীদের কাজ" artworks={paintingArt} />
      </div>
      <ArtSection title="হস্তশিল্প" subtitle="হাতে তৈরি অনন্য শিল্পকর্ম" artworks={handmadeArt} />

      {/* ── FEATURED ARTISTS ── */}
      {featuredArtists.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#b5944a' }}>শিল্পীরা</p>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900">যাচাইকৃত <span style={{ color: '#b5944a' }}>শিল্পীগণ</span></h2>
                <p className="text-stone-400 mt-2 text-sm">সেরা ও বিশ্বস্ত শিল্পীদের সাথে পরিচিত হন</p>
              </div>
              <Link to="/artists" className="flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all" style={{ color: '#b5944a' }}>
                সব শিল্পী <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredArtists.map((artist, i) => (
                <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/artist/${artist.id}`}
                    className="block bg-stone-50 border border-stone-100 rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group text-center"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(181,148,74,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                    <div className="relative h-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(181,148,74,0.1), rgba(181,148,74,0.05))' }}>
                      <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`}
                        alt={artist.full_name} className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md" />
                      {artist.is_verified && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ background: '#b5944a' }}>
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-stone-900 text-xs group-hover:text-[#b5944a] transition-colors leading-tight">{artist.full_name}</h3>
                      {artist.district && <p className="text-stone-400 text-[10px] mt-0.5 flex items-center justify-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{artist.district}</p>}
                      <p className="text-[10px] font-bold mt-1" style={{ color: '#b5944a' }}>{artist.total_sales} বিক্রয়</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ARTIST CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0f0b05' }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(181,148,74,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(181,148,74,0.1) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 border"
                style={{ background: 'rgba(181,148,74,0.15)', borderColor: 'rgba(181,148,74,0.4)', color: '#d4b06a' }}>
                <Palette className="w-4 h-4" /> শিল্পীদের জন্য
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
                আপনি কি একজন <em className="not-italic" style={{ color: '#d4b06a' }}>শিল্পী?</em>
              </h2>
              <p className="text-stone-400 text-lg mb-10 leading-relaxed">
                হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান। বিনামূল্যে যোগ দিন এবং আপনার শিল্পকর্ম বিক্রি করুন।
              </p>
              <div className="space-y-3 mb-10">
                {['বিনামূল্যে অ্যাকাউন্ট তৈরি করুন', 'শিল্পকর্ম আপলোড করুন', 'অর্ডার পান ও আয় করুন'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'rgba(181,148,74,0.3)', border: '1px solid rgba(181,148,74,0.5)' }}>{i + 1}</div>
                    <p className="text-stone-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl group"
                style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)', boxShadow: '0 8px 30px rgba(181,148,74,0.35)' }}>
                আজই বিক্রি শুরু করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[['০%', 'লিস্টিং ফি'], ['২৪/৭', 'সাপোর্ট'], ['১০০%', 'নিরাপদ লেনদেন'], ['৫০০+', 'সক্রিয় শিল্পী']].map(([n, l]) => (
                <div key={l} className="rounded-3xl p-8 text-center border"
                  style={{ background: 'rgba(181,148,74,0.07)', borderColor: 'rgba(181,148,74,0.2)' }}>
                  <h4 className="text-3xl font-display font-bold mb-1" style={{ color: '#d4b06a' }}>{n}</h4>
                  <p className="text-stone-400 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#b5944a' }}>FAQ</p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-stone-900">সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left gap-4">
                  <span className="font-bold text-stone-900 text-sm">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ background: openFaq === i ? '#b5944a' : 'white', color: openFaq === i ? 'white' : '#b5944a', border: '1px solid rgba(181,148,74,0.3)' }}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 text-stone-500 text-sm border-t border-stone-100 pt-4 leading-relaxed">{faq.a}</div>
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
