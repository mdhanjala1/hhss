import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft,
  User, Phone, MapPin, CheckCircle, X, Package, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const DISTRICTS = [
  'ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ',
  'কুমিল্লা','নারায়ণগঞ্জ','গাজীপুর','টাঙ্গাইল','ফরিদপুর','যশোর','বগুড়া','দিনাজপুর',
  'পাবনা','নোয়াখালী','ব্রাহ্মণবাড়িয়া','ঝিনাইদহ','সাতক্ষীরা','কুষ্টিয়া','মাগুরা',
  'নাটোর','চাঁপাইনবাবগঞ্জ','লক্ষ্মীপুর','চাঁদপুর','ফেনী','কক্সবাজার','বান্দরবান',
  'রাঙামাটি','খাগড়াছড়ি','হবিগঞ্জ','মৌলভীবাজার','সুনামগঞ্জ','নেত্রকোণা','কিশোরগঞ্জ',
  'মানিকগঞ্জ','মুন্সিগঞ্জ','নরসিংদী','শরীয়তপুর','মাদারীপুর','গোপালগঞ্জ','রাজবাড়ী',
  'অন্যান্য'
];

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', phone: '', district: '', address: '', note: ''
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const orderNumbers: string[] = [];
      for (const item of items) {
        for (let q = 0; q < item.quantity; q++) {
          const { data, error } = await supabase.from('orders').insert({
            artwork_id: item.artwork.id,
            artist_id: item.artwork.artist_id,
            customer_name: form.name,
            customer_phone: form.phone,
            customer_address: form.address,
            customer_district: form.district,
            customer_note: form.note,
            artwork_title: item.artwork.title,
            artwork_price: item.artwork.price,
            payment_method: 'Cash on Delivery',
          }).select('order_number').single();
          if (!error && data) orderNumbers.push(data.order_number);
        }
      }
      setOrderSuccess(orderNumbers);
      clearCart();
    } catch {
      toast.error('অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
    setSubmitting(false);
  };

  if (orderSuccess.length > 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl shadow-stone-200"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-14 h-14 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4">অর্ডার সফল হয়েছে! 🎉</h2>
          <p className="text-stone-500 mb-6">আপনার অর্ডার নম্বর সমূহ:</p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {orderSuccess.map(n => (
              <span key={n} className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-100">
                {n}
              </span>
            ))}
          </div>
          <p className="text-stone-500 text-sm mb-8">শিল্পী শীঘ্রই আপনার সাথে যোগাযোগ করবেন। ক্যাশ অন ডেলিভারিতে পেমেন্ট করুন।</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            আরও শপিং করুন
          </button>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <div className="w-28 h-28 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-14 h-14 text-stone-300" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4">আপনার কার্ট খালি</h2>
          <p className="text-stone-500 mb-8">পছন্দের শিল্পকর্মগুলো কার্টে যোগ করুন</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <ArrowLeft className="w-5 h-5" />
            মার্কেটপ্লেসে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-stone-100 hover:border-emerald-300 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-stone-900">আমার কার্ট</h1>
            <p className="text-stone-500 mt-1">{totalItems}টি পণ্য</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.artwork.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex gap-5 items-start"
                >
                  <Link to={`/artwork/${item.artwork.id}`} className="shrink-0">
                    <img
                      src={item.artwork.thumbnail_url || item.artwork.image_url}
                      alt={item.artwork.title}
                      className="w-24 h-28 rounded-2xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link to={`/artwork/${item.artwork.id}`} className="font-bold text-stone-900 text-lg hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.artwork.title}
                        </Link>
                        <p className="text-stone-400 text-sm mt-0.5">{item.artwork.artist?.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{item.artwork.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.artwork.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 bg-stone-50 rounded-2xl p-1 border border-stone-100">
                        <button
                          onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-stone-900 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-stone-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">৳{(item.artwork.price * item.quantity).toLocaleString()}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-stone-400">৳{item.artwork.price.toLocaleString()} × {item.quantity}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-sm text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 mt-2"
            >
              <Trash2 className="w-4 h-4" />
              সব মুছুন
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-stone-900 mb-6">অর্ডার সারসংক্ষেপ</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>মোট পণ্য ({totalItems}টি)</span>
                  <span>৳{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" />ডেলিভারি চার্জ</span>
                  <span>বিনামূল্যে</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-xl text-stone-900">
                  <span>সর্বমোট</span>
                  <span className="text-emerald-600">৳{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                <Package className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে পেমেন্ট করুন</p>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900">ডেলিভারি তথ্য</h3>
                    <p className="text-stone-400 text-sm mt-1">{totalItems}টি পণ্য · ৳{totalPrice.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-stone-100 rounded-full">
                    <X className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                {/* Cart summary in modal */}
                <div className="space-y-3 mb-8 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {items.map(item => (
                    <div key={item.artwork.id} className="flex items-center gap-3">
                      <img src={item.artwork.thumbnail_url || item.artwork.image_url} className="w-12 h-14 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-900 text-sm line-clamp-1">{item.artwork.title}</p>
                        <p className="text-stone-400 text-xs">পরিমাণ: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-emerald-600 text-sm shrink-0">৳{(item.artwork.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="আপনার পূর্ণ নাম *"
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="ফোন নম্বর *"
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={form.district}
                      onChange={e => setForm({ ...form, district: e.target.value })}
                    >
                      <option value="">জেলা নির্বাচন করুন *</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="বিস্তারিত ঠিকানা (বাড়ি, রাস্তা, এলাকা) *"
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    placeholder="অতিরিক্ত নোট (ঐচ্ছিক)"
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                  />

                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex justify-between items-center mb-4 text-lg font-bold">
                      <span className="text-stone-700">সর্বমোট</span>
                      <span className="text-emerald-600">৳{totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                    >
                      {submitting ? 'প্রসেস হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
                      {!submitting && <CheckCircle className="w-5 h-5" />}
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
