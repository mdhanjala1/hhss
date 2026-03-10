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
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(194,160,110,0.1)' }}>
          <Heart className="w-14 h-14" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>উইশলিস্ট খালি</h2>
        <p className="mb-8" style={{ color: 'var(--text2)' }}>পছন্দের শিল্পকর্মে ❤️ চাপুন</p>
        <Link to="/marketplace"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
          <ArrowLeft className="w-5 h-5" /> মার্কেটপ্লেসে যান
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>আমার উইশলিস্ট</h1>
        <p className="mb-10" style={{ color: 'var(--text2)' }}>{items.length}টি শিল্পকর্ম সংরক্ষিত</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map(art => {
              const inCart = isInCart(art.id);
              return (
                <motion.div key={art.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-3xl overflow-hidden border transition-all hover:shadow-lg group"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <Link to={`/artwork/${art.id}`}>
                      <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <button onClick={() => { toggle(art); toast.success('উইশলিস্ট থেকে সরানো হয়েছে'); }}
                      className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/artwork/${art.id}`}
                      className="font-bold text-sm line-clamp-1 block hover:underline"
                      style={{ color: 'var(--text)' }}>{art.title}</Link>
                    <p className="font-bold mt-1 mb-3" style={{ color: 'var(--accent)' }}>৳{art.price.toLocaleString()}</p>
                    <button
                      onClick={() => { addToCart(art); toast.success('কার্টে যোগ হয়েছে!'); }}
                      className="w-full py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
                      style={inCart
                        ? { background: 'rgba(194,160,110,0.1)', color: 'var(--accent-dk)', border: '1px solid rgba(194,160,110,0.3)' }
                        : { background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
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
