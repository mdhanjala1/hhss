import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, User, Star, ShieldCheck, Truck, ArrowLeft,
  CheckCircle, MessageSquare, Phone, MapPin, Heart, Share2,
  ImageIcon, X, ArrowRight, Plus, Minus, Package, Tag, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Artwork, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [relatedArt, setRelatedArt] = useState<Artwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, isInCart, updateQuantity: updateCartQty, items: cartItems } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [orderData, setOrderData] = useState({ name: '', phone: '', address: '', district: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({ name: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const DISTRICTS = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ','কুমিল্লা','নারায়ণগঞ্জ','গাজীপুর','টাঙ্গাইল','যশোর','বগুড়া','দিনাজপুর','পাবনা','নোয়াখালী','কক্সবাজার','অন্যান্য'];

  useEffect(() => { fetchArtwork(); }, [id]);

  const fetchArtwork = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('artworks').select('*, artist:artists(*)').eq('id', id).single();
    if (error) { toast.error('পাওয়া যায়নি'); navigate('/marketplace'); return; }
    setArtwork(data);

    const { data: rev } = await supabase.from('reviews').select('*').eq('artwork_id', id).eq('is_visible', true).order('created_at', { ascending: false });
    setReviews(rev || []);

    // Related artworks
    const { data: related } = await supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', data.category).neq('id', id).limit(4);
    setRelatedArt(related || []);

    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!artwork) return;
    addToCart(artwork, quantity);
    toast.success(`${quantity}টি "${artwork.title}" কার্টে যোগ হয়েছে! 🛒`);
  };

  const handleBuyNow = () => {
    if (!artwork) return;
    addToCart(artwork, quantity);
    navigate('/cart');
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;
    setSubmitting(true);
    try {
      for (let q = 0; q < quantity; q++) {
        const { error } = await supabase.from('orders').insert({
          artwork_id: artwork.id,
          artist_id: artwork.artist_id,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          customer_address: orderData.address,
          customer_district: orderData.district,
          customer_note: orderData.note,
          artwork_title: artwork.title,
          artwork_price: artwork.price,
          payment_method: 'Cash on Delivery',
        });
        if (error) throw error;
      }
      toast.success('অর্ডার সফল হয়েছে! শিল্পী শীঘ্রই যোগাযোগ করবেন।', { duration: 6000 });
      setShowOrderForm(false);
      setOrderData({ name: '', phone: '', address: '', district: '', note: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        artwork_id: artwork.id, artist_id: artwork.artist_id,
        customer_name: reviewData.name, rating: reviewData.rating,
        review_text: reviewData.text, is_visible: true,
      });
      if (error) throw error;
      toast.success('রিভিউ দেওয়ার জন্য ধন্যবাদ!');
      setReviewData({ name: '', rating: 5, text: '' });
      setShowReviewForm(false);
      fetchArtwork();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );
  if (!artwork) return null;

  const inCart = isInCart(artwork.id);
  const wishlisted = isWishlisted(artwork.id);
  const cartItem = cartItems.find(i => i.artwork.id === artwork.id);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors mb-8 group text-sm font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          মার্কেটপ্লেসে ফিরে যান
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-100 relative shadow-2xl shadow-stone-200">
              <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
              {artwork.is_featured && (
                <div className="absolute top-6 left-6">
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/90 backdrop-blur text-white text-xs font-bold uppercase rounded-full">
                    <Star className="w-3.5 h-3.5 fill-current" /> ফিচারড
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { toggle(artwork); toast.success(wishlisted ? 'উইশলিস্ট থেকে সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ হয়েছে'); }}
                className={`flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border ${wishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'bg-stone-50 text-stone-600 border-stone-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200'}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                {wishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্ট'}
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('লিংক কপি হয়েছে!'); }}
                className="flex-1 py-3.5 bg-stone-50 text-stone-600 rounded-2xl font-bold hover:bg-stone-100 transition-all flex items-center justify-center gap-2 border border-stone-100"
              >
                <Share2 className="w-5 h-5" /> শেয়ার করুন
              </button>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">{artwork.category}</span>
              {artwork.size_inches && <span className="text-stone-400 text-sm">{artwork.size_inches} ইঞ্চি</span>}
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">{artwork.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-4xl font-bold text-emerald-600">৳{artwork.price.toLocaleString()}</p>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(artwork.artist?.rating_avg || 0) ? 'text-amber-400 fill-current' : 'text-stone-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">({artwork.artist?.rating_count} রিভিউ)</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-stone-50 rounded-3xl p-6 mb-6 border border-stone-100">
              <p className="text-stone-600 leading-relaxed text-sm mb-5">{artwork.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {artwork.medium && (
                  <div className="bg-white rounded-2xl p-4 border border-stone-100">
                    <p className="text-stone-400 text-xs font-medium mb-1">মাধ্যম</p>
                    <p className="text-stone-900 font-bold">{artwork.medium}</p>
                  </div>
                )}
                {artwork.year_created && (
                  <div className="bg-white rounded-2xl p-4 border border-stone-100">
                    <p className="text-stone-400 text-xs font-medium mb-1">তৈরির বছর</p>
                    <p className="text-stone-900 font-bold">{artwork.year_created}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Artist */}
            <Link to={`/artist/${artwork.artist_id}`} className="flex items-center gap-4 p-5 bg-white border border-stone-100 rounded-3xl hover:shadow-lg transition-all group mb-6">
              <img src={artwork.artist?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artwork.artist?.full_name}`} alt="" className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">{artwork.artist?.full_name}</h4>
                  {artwork.artist?.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-stone-400 text-xs mt-0.5">{artwork.artist?.district} · {artwork.artist?.total_sales}টি বিক্রয়</p>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Quantity + Add to Cart */}
            <div className="space-y-3">
              {/* Quantity selector */}
              <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-stone-600 font-medium text-sm flex-1">পরিমাণ</p>
                <div className="flex items-center gap-1 bg-white rounded-2xl p-1 border border-stone-200">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-emerald-600 font-bold">৳{(artwork.price * quantity).toLocaleString()}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                    inCart
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-stone-100 text-stone-900 hover:bg-stone-200 border-2 border-transparent'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {inCart ? `কার্টে আছে (${cartItem?.quantity || 0}টি)` : 'কার্টে যোগ করুন'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/60 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  এখনই কিনুন
                </button>
              </div>

              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full py-3.5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all text-sm flex items-center justify-center gap-2"
              >
                সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)
              </button>

              <div className="flex items-center justify-center gap-8 text-stone-400 text-xs font-medium pt-1">
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> ফ্রি ডেলিভারি</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> কোয়ালিটি নিশ্চিত</span>
                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Artworks */}
        {relatedArt.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">একই ধরনের শিল্পকর্ম</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {relatedArt.map(art => (
                <Link key={art.id} to={`/artwork/${art.id}`} className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">{art.title}</h4>
                    <p className="text-emerald-600 font-bold text-sm mt-1">৳{art.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              ক্রেতাদের রিভিউ
              <span className="text-sm font-medium text-stone-400">({reviews.length}টি)</span>
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all text-sm"
            >
              রিভিউ দিন
            </button>
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
                <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-8 rounded-3xl border border-stone-100 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">আপনার নাম</label>
                      <input type="text" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={reviewData.name} onChange={e => setReviewData({ ...reviewData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">রেটিং</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewData({ ...reviewData, rating: s })}>
                            <Star className={`w-8 h-8 transition-colors ${s <= reviewData.rating ? 'text-amber-400 fill-current' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">আপনার মন্তব্য</label>
                    <textarea rows={4} required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" value={reviewData.text} onChange={e => setReviewData({ ...reviewData, text: e.target.value })}></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-3 text-stone-500 font-bold hover:text-stone-700">বাতিল</button>
                    <button type="submit" disabled={submittingReview} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">{submittingReview ? 'সাবমিট...' : 'জমা দিন'}</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-stone-900">{r.customer_name}</h4>
                    <p className="text-stone-400 text-xs">{format(new Date(r.created_at), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-stone-200'}`} />)}
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed italic">"{r.review_text}"</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full py-14 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <p className="text-stone-400">এখনো কোনো রিভিউ নেই।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Order Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderForm(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-stone-900">সরাসরি অর্ডার</h3>
                  <button onClick={() => setShowOrderForm(false)} className="p-2 hover:bg-stone-100 rounded-full"><X className="w-5 h-5 text-stone-400" /></button>
                </div>

                <div className="flex gap-4 p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100">
                  <img src={artwork.thumbnail_url || artwork.image_url} alt="" className="w-16 h-20 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{artwork.title}</h4>
                    <p className="text-emerald-600 font-bold mt-1">৳{(artwork.price * quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-7 h-7 bg-stone-200 rounded-lg flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(q => q+1)} className="w-7 h-7 bg-stone-200 rounded-lg flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      <span className="text-xs text-stone-400 ml-1">পরিমাণ</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOrder} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="text" required placeholder="আপনার পূর্ণ নাম *" className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={orderData.name} onChange={e => setOrderData({ ...orderData, name: e.target.value })} />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="tel" required placeholder="ফোন নম্বর *" className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={orderData.phone} onChange={e => setOrderData({ ...orderData, phone: e.target.value })} />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <select required className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-sm" value={orderData.district} onChange={e => setOrderData({ ...orderData, district: e.target.value })}>
                      <option value="">জেলা নির্বাচন করুন *</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <textarea rows={2} required placeholder="বিস্তারিত ঠিকানা *" className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm" value={orderData.address} onChange={e => setOrderData({ ...orderData, address: e.target.value })}></textarea>
                  <textarea rows={2} placeholder="অতিরিক্ত নোট (ঐচ্ছিক)" className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm" value={orderData.note} onChange={e => setOrderData({ ...orderData, note: e.target.value })}></textarea>
                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex justify-between mb-3 font-bold">
                      <span className="text-stone-700">মোট</span>
                      <span className="text-emerald-600 text-lg">৳{(artwork.price * quantity).toLocaleString()}</span>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? 'প্রসেস হচ্ছে...' : <><CheckCircle className="w-5 h-5" /> অর্ডার নিশ্চিত করুন</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
