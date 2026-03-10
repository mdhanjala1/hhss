import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, ArrowLeft, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { items, toggle } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (items.length === 0) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 pt-16">
      <div className="text-center">
        <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Heart className="w-14 h-14 text-red-300" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-4">উইশলিস্ট খালি</h2>
        <p className="text-stone-500 mb-8">পছন্দের শিল্পকর্মে ❤️ চাপুন</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all">
          <ArrowLeft className="w-5 h-5" /> মার্কেটপ্লেসে যান
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-stone-900 mb-2">আমার উইশলিস্ট</h1>
        <p className="text-stone-500 mb-10">{items.length}টি শিল্পকর্ম সংরক্ষিত</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map(art => {
              const inCart = isInCart(art.id);
              return (
                <motion.div key={art.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <Link to={`/artwork/${art.id}`}>
                      <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <button onClick={() => { toggle(art); toast.success('উইশলিস্ট থেকে সরানো হয়েছে'); }}
                      className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/artwork/${art.id}`} className="font-bold text-stone-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1 block">{art.title}</Link>
                    <p className="text-emerald-600 font-bold mt-1 mb-3">৳{art.price.toLocaleString()}</p>
                    <button
                      onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                      className={`w-full py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${inCart ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      {inCart ? <><Check className="w-4 h-4" /> কার্টে আছে</> : <><ShoppingBag className="w-4 h-4" /> কার্টে যোগ</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
