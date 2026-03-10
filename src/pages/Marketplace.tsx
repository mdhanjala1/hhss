import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ArrowRight, Star, Heart, ShoppingBag,
  SlidersHorizontal, X, ChevronDown, Eye, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Artwork } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const CATEGORIES = [
  { key: 'All', label: 'সবগুলো' },
  { key: 'Arabic Calligraphy', label: 'আরবি ক্যালিগ্রাফি' },
  { key: 'Painting', label: 'পেইন্টিং' },
  { key: 'Handicraft', label: 'বিশেষ শিল্পকর্ম' },
  { key: 'Sculpture', label: 'ভাস্কর্য' },
  { key: 'Digital Art', label: 'ডিজিটাল আর্ট' },
  { key: 'Photography', label: 'ফটোগ্রাফি' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'সর্বশেষ' },
  { key: 'price_asc', label: 'কম দাম' },
  { key: 'price_desc', label: 'বেশি দাম' },
  { key: 'popular', label: 'জনপ্রিয়' },
];

function ArtworkCard({ art }: { art: Artwork }) {
  const { addToCart, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(art.id);
  const inCart = isInCart(art.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(art);
    toast.success(`"${art.title}" কার্টে যোগ হয়েছে! 🛒`, { duration: 2000 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(art);
    toast.success(wishlisted ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে ❤️', { duration: 1500 });
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Image */}
      <Link to={`/artwork/${art.id}`} className="block relative aspect-[4/5] overflow-hidden" style={{ background: 'var(--bg)' }}>
        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {art.is_featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-bold uppercase rounded-full shadow"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))' }}>
              <Star className="w-3 h-3 fill-current" /> ফিচারড
            </span>
          )}
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full shadow"
            style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--accent-dk)' }}>
            {CATEGORIES.find(c => c.key === art.category)?.label || art.category}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
          style={{ background: 'linear-gradient(to top, rgba(26,14,5,0.75) 0%, transparent 60%)' }}>
          <span className="w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white"
            style={{ background: 'rgba(194,160,110,0.25)', backdropFilter: 'blur(4px)' }}>
            <Eye className="w-4 h-4" /> বিস্তারিত দেখুন
          </span>
        </div>
        {/* Image bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
      </Link>
      {/* Wishlist */}
      <button onClick={handleWishlist}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-stone-500 hover:text-red-500'}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Info */}
      <div className="p-4 relative">
        {/* Dot pattern corner */}
        <div className="absolute bottom-0 right-0 w-20 h-16 pointer-events-none overflow-hidden rounded-br-2xl"
          style={{ backgroundImage: 'radial-gradient(rgba(194,160,110,0.35) 1.2px, transparent 1.2px)', backgroundSize: '5px 5px' }} />
        <Link to={`/artwork/${art.id}`}>
          <h3 className="font-bold text-base leading-tight line-clamp-1 mb-1 hover:underline"
            style={{ color: 'var(--text)' }}>{art.title}</h3>
        </Link>
        <Link to={`/artist/${art.artist_id}`} className="text-xs transition-colors hover:underline" style={{ color: 'var(--text3)' }}>
          {art.artist?.full_name}
        </Link>
        {art.size_inches && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{art.size_inches} ইঞ্চি</p>}

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="min-w-0">
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>৳{art.price.toLocaleString()}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>সারাদেশে ডেলিভারি</p>
          </div>
          <button onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all hover:opacity-90 shrink-0"
            style={inCart
              ? { background: 'rgba(194,160,110,0.12)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.3)' }
              : { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{inCart ? '✓ কার্ট' : 'কার্ট'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Marketplace() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (!error) setArtworks(data || []);
    setLoading(false);
  };

  const filtered = artworks
    .filter(art => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || art.title.toLowerCase().includes(q) || art.artist?.full_name?.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
      const matchPrice = art.price >= priceRange[0] && art.price <= priceRange[1];
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return b.order_count - a.order_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const currentSort = SORT_OPTIONS.find(s => s.key === sortBy)?.label;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div>
              <p className="text-[#8b6914] font-semibold text-sm mb-2 uppercase tracking-wider">মার্কেটপ্লেস</p>
              <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight">
                বিশেষ <span className="text-[#8b6914]">শিল্পকর্ম</span>
              </h1>
              <p className="text-stone-500 mt-3 text-lg">দেশের সেরা শিল্পীদের অকৃত্রিম সৃষ্টি</p>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="শিল্পকর্ম বা শিল্পী খুঁজুন..."
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#c2a06e] outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-stone-400" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-medium text-stone-700 hover:border-[#c2a06e] transition-colors whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {currentSort}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/60 overflow-hidden z-20 min-w-[140px]"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${sortBy === opt.key ? 'bg-[#fdf8f0] text-[#8b6914]' : 'text-stone-700 hover:bg-stone-50'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-stone-500 text-sm font-medium">
              {filtered.length === 0 ? 'কোনো ফলাফল নেই' : `${filtered.length}টি শিল্পকর্ম পাওয়া গেছে`}
            </p>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-sm text-[#8b6914] font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> ফিল্টার মুছুন
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-stone-200 rounded-3xl mb-4"></div>
                <div className="h-4 bg-stone-200 rounded-full w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 rounded-full w-1/2 mb-3"></div>
                <div className="h-8 bg-stone-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900">কোনো শিল্পকর্ম পাওয়া যায়নি</h3>
            <p className="text-stone-500 mt-2">অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-6 px-6 py-3 bg-[#c2a06e] text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
            >
              সব দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(art => (
              <ArtworkCard key={art.id} art={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
