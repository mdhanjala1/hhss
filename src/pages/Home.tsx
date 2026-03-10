import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowRight, Star, ShieldCheck, Truck, Palette,
  Users, CheckCircle, Clock, Heart, ChevronDown, Zap, Award,
  Sparkles, ChevronLeft, ChevronRight as ChevronRightIcon, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artwork, Artist } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

const HERO_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200', caption: 'অনন্য চিত্রকলা' },
  { image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', caption: 'আরবি ক্যালিগ্রাফি' },
  { image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=1200', caption: 'হাতে তৈরি শিল্প' },
];

const CATEGORIES = [
  { key: 'Arabic Calligraphy', label: 'আরবি ক্যালিগ্রাফি', icon: '✍️', color: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-700' },
  { key: 'Painting', label: 'পেইন্টিং', icon: '🎨', color: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700' },
  { key: 'Digital Art', label: 'ডিজিটাল পেইন্টিং', icon: '💻', color: 'from-purple-50 to-violet-50', border: 'border-purple-200', text: 'text-purple-700' },
  { key: 'Handicraft', label: 'হাতে তৈরি ও ঘর সাজানো', icon: '🏺', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-700' },
];

const FEATURES = [
  { icon: <ShieldCheck className="w-7 h-7" />, title: 'নিরাপদ লেনদেন', desc: 'প্রতিটি অর্ডার আমরা সরাসরি তদারকি করি।' },
  { icon: <Award className="w-7 h-7" />, title: 'অকৃত্রিম শিল্পকর্ম', desc: '১০০% অরিজিনাল হাতে তৈরি শিল্প।' },
  { icon: <Truck className="w-7 h-7" />, title: 'সারা দেশে ডেলিভারি', desc: 'যত্ন সহকারে আপনার দোরগোড়ায় পৌঁছে দেই।' },
  { icon: <Zap className="w-7 h-7" />, title: 'সহজ রিটার্ন', desc: 'পণ্য পছন্দ না হলে সহজেই রিটার্ন করুন।' },
];

const FAQ_DATA = [
  { question: 'শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?', answer: 'পছন্দের শিল্পকর্মটি নির্বাচন করে অর্ডার করুন বাটনে ক্লিক করুন। ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করুন।' },
  { question: 'ডেলিভারি চার্জ কত?', answer: 'আমরা বর্তমানে সারা বাংলাদেশে ফ্রি ডেলিভারি দিচ্ছি।' },
  { question: 'আমি কি শিল্পী হিসেবে যোগ দিতে পারি?', answer: 'হ্যাঁ! শিল্পী হিসেবে যোগ দিন বাটনে ক্লিক করে অ্যাকাউন্ট তৈরি করুন।' },
  { question: 'পেমেন্ট পদ্ধতি কী?', answer: 'আমরা ক্যাশ অন ডেলিভারি (Cash on Delivery) সমর্থন করি।' },
];

function ArtworkCard({ art }: { art: Artwork }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-300">
      <Link to={`/artwork/${art.id}`} className="block relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {art.is_featured && <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/90 text-white text-[10px] font-bold rounded-full"><Star className="w-3 h-3 fill-current" />ফিচারড</span>}
        <button onClick={e => { e.preventDefault(); toggle(art); toast.success(isWishlisted(art.id) ? 'উইশলিস্ট থেকে সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ'); }} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur ${isWishlisted(art.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-400 hover:text-red-500'}`}>
          <Heart className={`w-4 h-4 ${isWishlisted(art.id) ? 'fill-current' : ''}`} />
        </button>
      </Link>
      <div className="p-4">
        <Link to={`/artwork/${art.id}`}><h3 className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3></Link>
        <p className="text-stone-400 text-xs mt-0.5">{art.artist?.full_name}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">ফ্রি ডেলিভারি</p>
          </div>
          <button onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে! 🛒'); }} className={`flex items-center gap-1 px-3 py-2 rounded-2xl font-bold text-xs transition-all ${isInCart(art.id) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {isInCart(art.id) ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArtworkSection({ title, artworks, bg = '' }: { title: string; artworks: Artwork[]; bg?: string }) {
  if (!artworks.length) return null;
  return (
    <section className={`py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">{title}</h2>
          <Link to="/marketplace" className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all">সব দেখুন <ArrowRight className="w-4 h-4" /></Link>
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
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    timer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: featured }, { data: cal }, { data: paint }, { data: hand }, { data: artsts }] = await Promise.all([
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('is_featured', true).limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Arabic Calligraphy').limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Painting').limit(4),
      supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', 'Handicraft').limit(4),
      supabase.from('artists').select('*').eq('is_verified', true).eq('is_active', true).order('total_sales', { ascending: false }).limit(5),
    ]);
    setFeaturedArt(featured || []); setCalligraphyArt(cal || []); setPaintingArt(paint || []); setHandmadeArt(hand || []); setFeaturedArtists(artsts || []);
    setLoading(false);
  };

  const nextSlide = () => { setSlide(s => (s + 1) % HERO_SLIDES.length); clearInterval(timer.current); };
  const prevSlide = () => { setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); clearInterval(timer.current); };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img key={slide} src={HERO_SLIDES[slide].image} alt="" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="w-full h-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              বাংলাদেশের ১ নম্বর আর্ট মার্কেটপ্লেস
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              সৃজনশীলতার<br />
              <span className="text-emerald-400 italic">নতুন দিগন্ত</span>
            </h1>
            <p className="text-stone-300 text-lg mb-10 leading-relaxed">দেশের সেরা শিল্পীদের হাতে তৈরি অনন্য শিল্পকর্ম। আপনার ঘর সাজান অকৃত্রিম সৌন্দর্যে।</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2 group">
                মার্কেটপ্লেস দেখুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                শিল্পী হিসেবে যোগ দিন
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-10 pt-10 border-t border-white/20">
              <div><p className="text-3xl font-bold text-white">৫০০+</p><p className="text-stone-400 text-sm">শিল্পী</p></div>
              <div className="w-px h-10 bg-white/20" />
              <div><p className="text-3xl font-bold text-white">২.৫কে+</p><p className="text-stone-400 text-sm">বিক্রিত শিল্পকর্ম</p></div>
              <div className="w-px h-10 bg-white/20" />
              <div><p className="text-3xl font-bold text-white">৬৪</p><p className="text-stone-400 text-sm">জেলায় ডেলিভারি</p></div>
            </div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/20 backdrop-blur border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/20 backdrop-blur border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? 'bg-emerald-400 w-8' : 'bg-white/40 w-2'}`} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold text-stone-900 mb-4">ক্যাটাগরি অনুযায়ী ব্রাউজ করুন</h2>
            <p className="text-stone-500">আপনার পছন্দের ক্যাটাগরি বেছে নিন</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/marketplace?category=${cat.key}`} className={`group bg-gradient-to-br ${cat.color} border ${cat.border} rounded-3xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className={`font-bold text-sm ${cat.text}`}>{cat.label}</h3>
                <p className="text-stone-400 text-xs mt-1 flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  দেখুন <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-3xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">{f.icon}</div>
                <h3 className="font-bold text-stone-900 text-sm mb-2">{f.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artworks */}
      <ArtworkSection title="নির্বাচিত শিল্পকর্ম" artworks={featuredArt} />
      <ArtworkSection title="আরবি ক্যালিগ্রাফি" artworks={calligraphyArt} bg="bg-amber-50/30" />
      <ArtworkSection title="পেইন্টিং" artworks={paintingArt} />
      <ArtworkSection title="হাতে তৈরি শিল্প" artworks={handmadeArt} bg="bg-stone-50" />

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">আমাদের <span className="text-emerald-600">শিল্পীরা</span></h2>
                <p className="text-stone-500 mt-2">যাচাইকৃত ও দক্ষ শিল্পীদের সাথে পরিচিত হন</p>
              </div>
              <Link to="/artists" className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all">সব শিল্পী <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {featuredArtists.map((artist, i) => (
                <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link to={`/artist/${artist.id}`} className="block bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
                    <div className="relative h-24 bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center">
                      <img src={artist.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.full_name}`} alt={artist.full_name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md relative z-10" />
                      {artist.is_verified && <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full z-10"><ShieldCheck className="w-3 h-3" /></div>}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-stone-900 text-xs group-hover:text-emerald-600 transition-colors leading-tight">{artist.full_name}</h3>
                      {artist.district && <p className="text-stone-400 text-[10px] mt-0.5">{artist.district}</p>}
                      <p className="text-emerald-600 text-[10px] font-bold mt-1">{artist.total_sales} বিক্রয়</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Artist CTA */}
      <section className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold mb-8 border border-emerald-500/30">
                <Palette className="w-4 h-4" /> শিল্পীদের জন্য বিশেষ সুযোগ
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">আপনি কি একজন <span className="text-emerald-400 italic">শিল্পী?</span></h2>
              <p className="text-stone-400 text-lg mb-10 leading-relaxed">হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান। আপনার সৃজনশীল ব্যবসা বৃদ্ধি করুন।</p>
              <Link to="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl group">
                আজই বিক্রি শুরু করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-5">
              {[['০%', 'লিস্টিং ফি'], ['২৪/৭', 'সাপোর্ট'], ['১০০%', 'নিরাপদ'], ['৫কে+', 'সক্রিয় ক্রেতা']].map(([n, l]) => (
                <div key={l} className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                  <h4 className="text-3xl font-bold text-white mb-1">{n}</h4>
                  <p className="text-stone-400 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold text-stone-900 mb-4">সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-bold text-stone-900">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ml-4 ${openFaq === i ? 'bg-emerald-600 text-white rotate-180' : 'bg-stone-100 text-stone-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 text-stone-500 border-t border-stone-50 pt-4">{faq.answer}</div>
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
