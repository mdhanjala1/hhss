import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, CheckCircle, MapPin, Phone, User, MessageSquare, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', district: '', note: '' });
  const set = (k: string, v: string) => setCustomer(c => ({ ...c, [k]: v }));

  const DISTRICTS = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ','কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টাঙ্গাইল','কক্সবাজার','ফেনী','নোয়াখালী'];

  const handleOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.district) {
      toast.error('নাম, ফোন, ঠিকানা ও জেলা দিন'); return;
    }
    if (customer.phone.length < 11) { toast.error('সঠিক ফোন নম্বর দিন'); return; }
    setOrdering(true);
    try {
      const nums: string[] = [];
      for (const item of items) {
        const orderNum = 'SH' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
        const { error } = await supabase.from('orders').insert({
          artwork_id: item.artwork.id,
          artist_id: item.artwork.artist_id,
          artwork_title: item.artwork.title,
          artwork_price: item.artwork.price * item.quantity,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address,
          customer_district: customer.district,
          customer_note: customer.note,
          quantity: item.quantity,
          status: 'new',
          order_number: orderNum,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        nums.push(orderNum);
        // Notify artist
        await supabase.from('notifications').insert({
          artist_id: item.artwork.artist_id,
          title: '🛒 নতুন অর্ডার!',
          message: `"${item.artwork.title}" এর জন্য নতুন অর্ডার এসেছে। ক্রেতা: ${customer.name}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
      setOrderNumbers(nums);
      clearCart();
      setOrderSuccess(true);
    } catch (e: any) {
      toast.error('অর্ডার ব্যর্থ: ' + (e.message || 'আবার চেষ্টা করুন'));
    } finally { setOrdering(false); }
  };

  if (orderSuccess) return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(194,160,110,0.12)' }}>
          <CheckCircle className="w-14 h-14" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>অর্ডার সফল হয়েছে! 🎉</h2>
        <p className="mb-4" style={{ color: 'var(--text2)' }}>আপনার অর্ডার নম্বর সমূহ:</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {orderNumbers.map(n => (
            <span key={n} className="px-4 py-2 font-bold rounded-xl text-sm border"
              style={{ background: 'rgba(194,160,110,0.08)', color: 'var(--accent-dk)', borderColor: 'rgba(194,160,110,0.25)' }}>#{n}</span>
          ))}
        </div>
        <p className="text-sm mb-8" style={{ color: 'var(--text3)' }}>শিল্পী শীঘ্রই যোগাযোগ করবেন। ক্যাশ অন ডেলিভারিতে পেমেন্ট করুন।</p>
        <button onClick={() => navigate('/marketplace')}
          className="w-full py-4 rounded-2xl font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
          মার্কেটপ্লেসে ফিরুন
        </button>
      </motion.div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(194,160,110,0.1)' }}>
          <ShoppingBag className="w-14 h-14" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>আপনার কার্ট খালি</h2>
        <p className="mb-8" style={{ color: 'var(--text2)' }}>পছন্দের শিল্পকর্মগুলো কার্টে যোগ করুন</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="p-3 rounded-2xl border transition-all hover:shadow-md"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text)' }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>আমার কার্ট</h1>
            <p style={{ color: 'var(--text3)' }}>{totalItems}টি পণ্য</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.artwork.id} layout exit={{ opacity: 0, x: -20 }}
                  className="rounded-3xl p-5 border flex gap-4 items-start"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <Link to={`/artwork/${item.artwork.id}`} className="shrink-0">
                    <img src={item.artwork.thumbnail_url || item.artwork.image_url} alt={item.artwork.title}
                      className="w-24 h-24 rounded-2xl object-cover" style={{ background: 'var(--bg)' }} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/artwork/${item.artwork.id}`}
                      className="font-bold text-base hover:underline line-clamp-1"
                      style={{ color: 'var(--text)' }}>{item.artwork.title}</Link>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>{item.artwork.artist?.full_name}</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                      style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--text3)' }}>
                      {item.artwork.category}
                    </span>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      {/* Qty control */}
                      <div className="flex items-center gap-1 rounded-xl p-1 border"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                        <button onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:shadow-sm transition-all"
                          style={{ color: 'var(--text)' }}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:shadow-sm transition-all"
                          style={{ color: 'var(--text)' }}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                        ৳{(item.artwork.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { removeFromCart(item.artwork.id); toast.success('সরানো হয়েছে'); }}
                    className="p-2 rounded-xl transition-all hover:bg-red-50 hover:text-red-500 shrink-0"
                    style={{ color: 'var(--text3)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear cart */}
            <button onClick={() => { clearCart(); toast.success('কার্ট পরিষ্কার হয়েছে'); }}
              className="text-sm flex items-center gap-1 mt-2 transition-colors hover:text-red-500"
              style={{ color: 'var(--text3)' }}>
              <Trash2 className="w-3.5 h-3.5" /> সব মুছুন
            </button>
          </div>

          {/* Order Summary + Customer Info */}
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-3xl p-6 border sticky top-24"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>অর্ডার সারসংক্ষেপ</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between" style={{ color: 'var(--text2)' }}>
                  <span>পণ্য ({totalItems}টি)</span>
                  <span>৳{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--accent)' }}>
                  <span>ডেলিভারি</span>
                  <span>বিনামূল্যে</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <span>মোট</span>
                  <span style={{ color: 'var(--accent)' }}>৳{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* COD notice */}
              <div className="flex items-center gap-2 p-3 rounded-2xl mb-5 text-sm"
                style={{ background: 'rgba(194,160,110,0.08)', border: '1px solid rgba(194,160,110,0.2)' }}>
                <Package className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text2)' }}>ক্যাশ অন ডেলিভারি</span>
              </div>

              {/* Customer form */}
              <div className="space-y-3 mb-5">
                {[
                  { k: 'name', label: 'আপনার নাম *', ph: 'পূর্ণ নাম', icon: <User className="w-4 h-4" /> },
                  { k: 'phone', label: 'মোবাইল *', ph: '01XXXXXXXXX', icon: <Phone className="w-4 h-4" /> },
                  { k: 'address', label: 'ঠিকানা *', ph: 'বিস্তারিত ঠিকানা', icon: <MapPin className="w-4 h-4" /> },
                ].map(({ k, label, ph, icon }) => (
                  <div key={k}>
                    <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text2)' }}>{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>{icon}</span>
                      <input type="text" placeholder={ph} value={(customer as any)[k]} onChange={e => set(k, e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none text-sm focus:ring-2"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text2)' }}>জেলা *</label>
                  <select value={customer.district} onChange={e => set('district', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <option value="">জেলা বেছে নিন</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text2)' }}>নোট (ঐচ্ছিক)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text3)' }} />
                    <textarea placeholder="বিশেষ নির্দেশনা..." value={customer.note} onChange={e => set('note', e.target.value)}
                      rows={2} className="w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none text-sm resize-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                  </div>
                </div>
              </div>

              <button onClick={handleOrder} disabled={ordering}
                className="w-full py-4 rounded-2xl font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dk))', color: 'var(--dark)' }}>
                {ordering
                  ? <><div className="w-5 h-5 border-2 border-[var(--dark)]/30 border-t-[var(--dark)] rounded-full animate-spin" /> অর্ডার হচ্ছে...</>
                  : <><CheckCircle className="w-5 h-5" /> অর্ডার করুন</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
