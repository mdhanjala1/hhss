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
  { key: 'Handicraft', label: 'হাতে তৈরি শিল্প' },
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:border-stone-200 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Link to={`/artwork/${art.id}`}>
          <img
            src={art.image_url}
            alt={art.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {art.is_featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-current" /> ফিচারড
            </span>
          )}
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-stone-700 text-[10px] font-bold rounded-full shadow-sm">
            {CATEGORIES.find(c => c.key === art.category)?.label || art.category}
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-500 hover:bg-red-50 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Link
            to={`/artwork/${art.id}`}
            className="w-full py-2.5 bg-white/90 backdrop-blur text-stone-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="w-4 h-4" /> বিস্তারিত দেখুন
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <Link to={`/artwork/${art.id}`}>
          <h3 className="font-bold text-stone-900 text-base leading-tight hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
            {art.title}
          </h3>
        </Link>
        <Link to={`/artist/${art.artist_id}`} className="text-stone-400 text-xs hover:text-emerald-600 transition-colors">
          {art.artist?.full_name}
        </Link>

        {art.size_inches && (
          <p className="text-stone-400 text-xs mt-1">{art.size_inches} ইঞ্চি</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xl font-bold text-stone-900">৳{art.price.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-medium">ফ্রি ডেলিভারি</p>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              inCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200'
            }`}
          >
            {inCart ? (
              <><Check className="w-4 h-4" /> যোগ হয়েছে</>
            ) : (
              <><ShoppingBag className="w-4 h-4" /> কার্টে যোগ</>
            )}
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
              <p className="text-emerald-600 font-semibold text-sm mb-2 uppercase tracking-wider">মার্কেটপ্লেস</p>
              <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight">
                হাতে তৈরি <span className="text-emerald-600">শিল্পকর্ম</span>
              </h1>
              <p className="text-stone-500 mt-3 text-lg">দেশের সেরা শিল্পীদের অকৃত্রিম সৃষ্টি</p>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="শিল্পকর্ম বা শিল্পী খুঁজুন..."
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
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
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-medium text-stone-700 hover:border-emerald-300 transition-colors whitespace-nowrap"
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
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${sortBy === opt.key ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700 hover:bg-stone-50'}`}
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
                className="text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1"
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
              className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
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
