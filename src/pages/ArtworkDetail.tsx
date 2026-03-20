import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, User, Star, ShieldCheck, Truck, ArrowLeft,
  CheckCircle, MessageSquare, Phone, MapPin, Heart, Share2,
  X, ArrowRight, Plus, Minus, Tag, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Artwork, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const W = 'var(--accent)';
const WD = 'var(--accent-dk)';

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [relatedArt, setRelatedArt] = useState<Artwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, isInCart, items: cartItems } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [orderData, setOrderData] = useState({ name: '', phone: '', address: '', district: '', note: '' });
  const [deliveryZone, setDeliveryZone] = useState<'dhaka' | 'outside' | ''>('');
  const DELIVERY_CHARGE = { dhaka: 60, outside: 130 };
  const deliveryCharge = deliveryZone ? DELIVERY_CHARGE[deliveryZone] : 0;
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
    const { data: related } = await supabase.from('artworks').select('*, artist:artists(*)').eq('status', 'approved').eq('category', data.category).neq('id', id).limit(4);
    setRelatedArt(related || []);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!artwork) return;
    addToCart(artwork, quantity);
    toast.success(`"${artwork.title}" কার্টে যোগ হয়েছে! 🛒`);
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
        const itemPrice = (discountedPrice || artwork.price);
        const totalWithDelivery = (itemPrice * quantity) + deliveryCharge;
        const { error } = await supabase.from('orders').insert({
          artwork_id: artwork.id,
          artist_id: artwork.artist_id,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          customer_address: `${orderData.address} [ডেলিভারি: ৳${deliveryCharge}]`,
          customer_district: orderData.district,
          customer_note: orderData.note || null,
          artwork_title: quantity > 1 ? `${artwork.title} (×${quantity})` : artwork.title,
          artwork_price: totalWithDelivery,
          payment_method: 'Cash on Delivery',
        });
        if (error) throw error;
      }
      toast.success('অর্ডার সফল হয়েছে! শিল্পী শীঘ্রই যোগাযোগ করবেন।', { duration: 6000 });
      setShowOrderForm(false);
      setOrderData({ name: '', phone: '', address: '', district: '', note: '' });
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
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
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );
  if (!artwork) return null;

  const inCart = isInCart(artwork.id);
  const wishlisted = isWishlisted(artwork.id);
  const cartItem = cartItems.find(i => i.artwork.id === artwork.id);
  const discountedPrice = artwork.discount_percent && artwork.discount_percent > 0
    ? Math.round(artwork.price * (1 - artwork.discount_percent / 100))
    : null;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Breadcrumb */}
        <Link to="/marketplace"
          className="inline-flex items-center gap-2 mb-8 group text-sm font-medium transition-colors"
          style={{ color: 'var(--text3)' }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          মার্কেটপ্লেসে ফিরে যান
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── Image Column ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px var(--shadow)' }}>
              <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
              {artwork.is_featured && (
                <div className="absolute top-5 left-5">
                  <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-full backdrop-blur"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                    <Star className="w-3.5 h-3.5 fill-current" /> ফিচারড
                  </span>
                </div>
              )}
              {discountedPrice && (
                <div className="absolute top-5 right-5 w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  -{artwork.discount_percent}%
                </div>
              )}
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3">
              <button
                onClick={() => { toggle(artwork); toast.success(wishlisted ? 'উইশলিস্ট থেকে সরানো হয়েছে' : '❤️ উইশলিস্টে যোগ হয়েছে'); }}
                className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border"
                style={wishlisted
                  ? { background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }
                  : { background: 'var(--card)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                {wishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্ট'}
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('লিংক কপি হয়েছে!'); }}
                className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border"
                style={{ background: 'var(--card)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
                <Share2 className="w-5 h-5" /> শেয়ার করুন
              </button>
            </div>
          </motion.div>

          {/* ── Info Column ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">

            {/* Category + Size */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(194,160,110,0.12)', color: 'var(--accent-dk)' }}>
                {artwork.category}
              </span>
              {artwork.size_inches && (
                <span className="text-sm" style={{ color: 'var(--text3)' }}>{artwork.size_inches} ইঞ্চি</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--text)' }}>
              {artwork.title}
            </h1>

            {/* Price + Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div>
                {discountedPrice ? (
                  <div>
                    <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>৳{discountedPrice.toLocaleString()}</p>
                    <p className="text-sm line-through mt-0.5" style={{ color: 'var(--text3)' }}>৳{artwork.price.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>৳{artwork.price.toLocaleString()}</p>
                )}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(artwork.artist?.rating_avg || 0) ? 'fill-current' : ''}`}
                      style={{ color: i < Math.round(artwork.artist?.rating_avg || 0) ? '#f59e0b' : 'var(--border)' }} />
                  ))}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>({artwork.artist?.rating_count} রিভিউ)</p>
              </div>
            </div>

            {/* Details box */}
            <div className="rounded-2xl p-5 mb-5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {artwork.description && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text2)' }}>{artwork.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {artwork.medium && (
                  <div className="rounded-xl p-3 border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>মাধ্যম</p>
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{artwork.medium}</p>
                  </div>
                )}
                {artwork.year_created && (
                  <div className="rounded-xl p-3 border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>তৈরির বছর</p>
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{artwork.year_created}</p>
                  </div>
                )}
                {artwork.colors && (
                  <div className="rounded-xl p-3 border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>রঙ</p>
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{artwork.colors}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Artist card */}
            <Link to={`/artist/${artwork.artist_id}`}
              className="flex items-center gap-4 p-4 rounded-2xl border mb-5 transition-all hover:shadow-md group"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <img src={artwork.artist?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artwork.artist?.full_name}`}
                alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{artwork.artist?.full_name}</h4>
                  {artwork.artist?.is_verified && <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                  {artwork.artist?.district} · {artwork.artist?.total_sales}টি বিক্রয়
                </p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text3)' }} />
            </Link>

            {/* Quantity + CTA */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium flex-1" style={{ color: 'var(--text2)' }}>পরিমাণ</p>
                <div className="flex items-center gap-1 rounded-xl p-1"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--text)' }}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold" style={{ color: 'var(--text)' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--text)' }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bold" style={{ color: 'var(--accent)' }}>
                  ৳{((discountedPrice || artwork.price) * quantity).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm border"
                  style={inCart
                    ? { background: 'rgba(194,160,110,0.08)', color: 'var(--accent-dk)', borderColor: 'rgba(194,160,110,0.3)' }
                    : { background: 'var(--card)', color: 'var(--text)', borderColor: 'var(--border)' }}>
                  <ShoppingBag className="w-5 h-5" />
                  {inCart ? `কার্টে আছে (${cartItem?.quantity || 0}টি)` : 'কার্টে যোগ করুন'}
                </button>
                <button onClick={handleBuyNow}
                  className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                  <CheckCircle className="w-5 h-5" /> এখনই কিনুন
                </button>
              </div>

              <button onClick={() => setShowOrderForm(true)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: 'var(--dark)', color: 'var(--bg)' }}>
                সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)
              </button>

              <div className="flex items-center justify-center gap-6 text-xs font-medium pt-1 flex-wrap"
                style={{ color: 'var(--text3)' }}>
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> সারাদেশে ডেলিভারি</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> কোয়ালিটি নিশ্চিত</span>
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Related Artworks ── */}
        {relatedArt.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>একই ধরনের শিল্পকর্ম</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedArt.map(art => (
                <Link key={art.id} to={`/artwork/${art.id}`}
                  className="group rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="aspect-[4/5] overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  {/* Price area with dot ornament */}
                  <div className="p-3 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-16 h-full pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(194,160,110,0.45) 1.5px, transparent 1.5px)',
                        backgroundSize: '7px 7px',
                        backgroundPosition: 'right bottom',
                        maskImage: 'radial-gradient(ellipse 80% 90% at 100% 100%, black 40%, transparent 100%)'
                      }} />
                    <div className="relative z-10">
                      <h4 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text)' }}>{art.title}</h4>
                      <p className="font-bold text-sm mt-1" style={{ color: 'var(--accent)' }}>৳{art.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
              <MessageSquare className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              রিভিউ <span className="text-sm font-medium" style={{ color: 'var(--text3)' }}>({reviews.length}টি)</span>
            </h2>
            <button onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'var(--dark)', color: 'var(--bg)' }}>
              রিভিউ দিন
            </button>
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
                <form onSubmit={handleReviewSubmit} className="p-6 rounded-2xl border space-y-4"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>আপনার নাম</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        value={reviewData.name} onChange={e => setReviewData({ ...reviewData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>রেটিং</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewData({ ...reviewData, rating: s })}>
                            <Star className={`w-8 h-8 transition-colors ${s <= reviewData.rating ? 'fill-current' : ''}`}
                              style={{ color: s <= reviewData.rating ? '#f59e0b' : 'var(--border)' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>মন্তব্য</label>
                    <textarea rows={4} required className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      value={reviewData.text} onChange={e => setReviewData({ ...reviewData, text: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowReviewForm(false)}
                      className="px-6 py-3 font-bold transition-colors" style={{ color: 'var(--text3)' }}>বাতিল</button>
                    <button type="submit" disabled={submittingReview}
                      className="px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                      {submittingReview ? 'সাবমিট...' : 'জমা দিন'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map(r => (
              <div key={r.id} className="p-5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--text)' }}>{r.customer_name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{format(new Date(r.created_at), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : ''}`}
                        style={{ color: i < r.rating ? '#f59e0b' : 'var(--border)' }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text2)' }}>"{r.review_text}"</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full py-14 text-center rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <p style={{ color: 'var(--text3)' }}>এখনো কোনো রিভিউ নেই।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Order Modal ── */}
      <AnimatePresence>
        {showOrderForm && artwork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowOrderForm(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(26,14,5,0.7)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="p-4 sm:p-7">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>সরাসরি অর্ডার</h3>
                  <button onClick={() => setShowOrderForm(false)}
                    className="p-2 rounded-full transition-colors" style={{ color: 'var(--text3)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl mb-5 border"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <img src={artwork.thumbnail_url || artwork.image_url} alt="" className="w-16 h-20 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{artwork.title}</h4>
                    <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>৳{((discountedPrice || artwork.price) * quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q-1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--border)', color: 'var(--text)' }}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center" style={{ color: 'var(--text)' }}>{quantity}</span>
                      <button onClick={() => setQuantity(q => q+1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--border)', color: 'var(--text)' }}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOrder} className="space-y-3">
                  {[
                    { icon: <User className="w-4 h-4" />, ph: 'আপনার পূর্ণ নাম *', k: 'name', type: 'text' },
                    { icon: <Phone className="w-4 h-4" />, ph: 'ফোন নম্বর *', k: 'phone', type: 'tel' },
                  ].map(({ icon, ph, k, type }) => (
                    <div key={k} className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>{icon}</span>
                      <input type={type} required placeholder={ph}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border outline-none text-sm"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        value={(orderData as any)[k]} onChange={e => setOrderData({ ...orderData, [k]: e.target.value })} />
                    </div>
                  ))}
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text3)' }} />
                    <select required className="w-full pl-11 pr-4 py-3.5 rounded-2xl border outline-none appearance-none text-sm"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      value={orderData.district} onChange={e => setOrderData({ ...orderData, district: e.target.value })}>
                      <option value="">জেলা নির্বাচন করুন *</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <textarea rows={2} required placeholder="বিস্তারিত ঠিকানা *"
                    className="w-full px-4 py-3.5 rounded-2xl border outline-none resize-none text-sm"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    value={orderData.address} onChange={e => setOrderData({ ...orderData, address: e.target.value })} />
                  <textarea rows={2} placeholder="অতিরিক্ত নোট (ঐচ্ছিক)"
                    className="w-full px-4 py-3.5 rounded-2xl border outline-none resize-none text-sm"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    value={orderData.note} onChange={e => setOrderData({ ...orderData, note: e.target.value })} />
                  {/* Delivery Zone */}
                  <div className="rounded-2xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text2)' }}>
                      <Truck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      ডেলিভারি এলাকা নির্বাচন করুন *
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button"
                        onClick={() => setDeliveryZone('dhaka')}
                        className="py-3 px-3 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: deliveryZone === 'dhaka' ? 'var(--accent)' : 'var(--border)',
                          background: deliveryZone === 'dhaka' ? 'rgba(194,160,110,0.1)' : 'var(--card)',
                          color: 'var(--text)'
                        }}>
                        <p className="font-bold text-sm">🏙️ ঢাকার মধ্যে</p>
                        <p className="text-xs mt-0.5 font-bold" style={{ color: 'var(--accent)' }}>৳৬০ ডেলিভারি</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>১–৩ কার্যদিবস</p>
                      </button>
                      <button type="button"
                        onClick={() => setDeliveryZone('outside')}
                        className="py-3 px-3 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: deliveryZone === 'outside' ? 'var(--accent)' : 'var(--border)',
                          background: deliveryZone === 'outside' ? 'rgba(194,160,110,0.1)' : 'var(--card)',
                          color: 'var(--text)'
                        }}>
                        <p className="font-bold text-sm">📦 ঢাকার বাইরে</p>
                        <p className="text-xs mt-0.5 font-bold" style={{ color: 'var(--accent)' }}>৳১৩০ ডেলিভারি</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>৩–৭ কার্যদিবস</p>
                      </button>
                    </div>
                    {deliveryZone && (
                      <div className="mt-3 flex items-center gap-2 text-xs px-2 py-1.5 rounded-xl"
                        style={{ background: 'rgba(194,160,110,0.07)', color: 'var(--text3)' }}>
                        <Package className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        {deliveryZone === 'dhaka'
                          ? 'পাঠাও / শ্যাডো কুরিয়ারে ডেলিভারি'
                          : 'সুন্দরবন / রেডএক্স কুরিয়ারে ডেলিভারি'}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    {/* Price breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm" style={{ color: 'var(--text2)' }}>
                        <span>শিল্পকর্মের মূল্য</span>
                        <span>৳{((discountedPrice || artwork.price) * quantity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ color: 'var(--text2)' }}>
                        <span>ডেলিভারি চার্জ</span>
                        <span style={{ color: deliveryZone ? 'var(--text)' : 'var(--text3)' }}>
                          {deliveryZone ? `৳${deliveryCharge}` : '— এলাকা নির্বাচন করুন'}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                        <span style={{ color: 'var(--text)' }}>মোট</span>
                        <span className="text-lg" style={{ color: 'var(--accent)' }}>
                          {deliveryZone
                            ? `৳${(((discountedPrice || artwork.price) * quantity) + deliveryCharge).toLocaleString()}`
                            : `৳${((discountedPrice || artwork.price) * quantity).toLocaleString()} + ডেলিভারি`}
                        </span>
                      </div>
                    </div>
                    <button type="submit" disabled={submitting || !deliveryZone}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-all"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                      {submitting ? 'প্রসেস হচ্ছে...' : <><CheckCircle className="w-5 h-5" /> অর্ডার নিশ্চিত করুন</>}
                    </button>
                    {!deliveryZone && <p className="text-center text-xs mt-2" style={{ color: '#e08080' }}>* ডেলিভারি এলাকা নির্বাচন করুন</p>}
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
