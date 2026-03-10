import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Search, CreditCard, Package, Star, Upload, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';

const W = '#c2a06e';

const BUYER_STEPS = [
  { icon: <Search className="w-7 h-7" />, title: 'শিল্পকর্ম খুঁজুন', desc: 'মার্কেটপ্লেস ব্রাউজ করুন। ক্যাটাগরি, মূল্য বা শিল্পী নাম দিয়ে খুঁজুন।', step: '০১' },
  { icon: <ShoppingBag className="w-7 h-7" />, title: 'অর্ডার করুন', desc: 'আপনার নাম, ফোন ও ঠিকানা দিয়ে অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারিতে পেমেন্ট।', step: '০২' },
  { icon: <Package className="w-7 h-7" />, title: 'ডেলিভারি পান', desc: 'শিল্পী আপনার অর্ডার নিশ্চিত করবেন। সারা বাংলাদেশে ডেলিভারি হবে।', step: '০৩' },
  { icon: <Star className="w-7 h-7" />, title: 'রিভিউ দিন', desc: 'শিল্পকর্ম পেয়ে আপনার অভিজ্ঞতা শেয়ার করুন। রিভিউ অন্য ক্রেতাদের সাহায্য করে।', step: '০৪' },
];
const ARTIST_STEPS = [
  { icon: <User className="w-7 h-7" />, title: 'অ্যাকাউন্ট তৈরি করুন', desc: 'নাম, ইমেইল ও পাসওয়ার্ড দিয়ে বিনামূল্যে অ্যাকাউন্ট খুলুন।', step: '০১' },
  { icon: <ShieldCheck className="w-7 h-7" />, title: 'NID যাচাই করুন', desc: 'ড্যাশবোর্ড থেকে NID কার্ডের তথ্য ও ছবি জমা দিন। এডমিন যাচাই করলে Verified ব্যাজ পাবেন।', step: '০২' },
  { icon: <Upload className="w-7 h-7" />, title: 'শিল্পকর্ম আপলোড করুন', desc: 'ড্যাশবোর্ড থেকে শিল্পকর্মের ছবি, বিবরণ ও মূল্য যোগ করুন।', step: '০৩' },
  { icon: <DollarSign className="w-7 h-7" />, title: 'অর্ডার পান ও আয় করুন', desc: 'ক্রেতা অর্ডার করলে নোটিফিকেশন পাবেন। অর্ডার নিশ্চিত করুন এবং পণ্য পৌঁছে দিন।', step: '০৪' },
];

export default function HowItWorks() {
  const [tab, setTab] = useState<'buyer' | 'artist'>('buyer');
  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(194,160,110,0.12)', color: W }}>গাইড</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>শিল্পশপ কীভাবে ব্যবহার করবেন?</h1>
          <p className="text-lg" style={{ color: 'var(--text2)' }}>ক্রেতা ও শিল্পী উভয়ের জন্য ধাপে ধাপে নির্দেশিকা</p>
        </div>

        {/* Tab */}
        <div className="flex rounded-2xl p-1.5 border mb-12 max-w-sm mx-auto"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {[['buyer','🛍️ ক্রেতা'], ['artist','🎨 শিল্পী']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as any)}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={tab === v
                ? { background: `linear-gradient(135deg,${W},#8b6914)`, color: 'white' }
                : { color: 'var(--text2)' }}>
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {(tab === 'buyer' ? BUYER_STEPS : ARTIST_STEPS).map((s, i) => (
            <motion.div key={`${tab}-${i}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-3xl border p-7 hover:shadow-lg hover:-translate-y-1 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: W, opacity: 0.7 }}>{s.step}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Artist tips */}
        {tab === 'artist' && (
          <div className="mb-12 rounded-3xl border p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>ড্যাশবোর্ডের সুবিধাসমূহ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { title: 'ওভারভিউ', desc: 'আয়, বিক্রয় ও অর্ডারের সারাংশ' },
                { title: 'শিল্পকর্ম', desc: 'আপলোড করা কাজ ম্যানেজ করুন' },
                { title: 'অর্ডার', desc: 'নতুন অর্ডার দেখুন ও নিশ্চিত করুন' },
                { title: 'আয়', desc: 'মাসিক আয়ের বিশ্লেষণ' },
                { title: 'নোটিফিকেশন', desc: 'অর্ডার ও এডমিনের বার্তা' },
                { title: 'সেটিংস', desc: 'প্রোফাইল ও সোশ্যাল লিংক আপডেট' },
              ].map((f, i) => (
                <div key={i} className="rounded-2xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <h4 className="font-bold mb-1.5" style={{ color: W }}>{f.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to={tab === 'buyer' ? '/marketplace' : '/login'}
            className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-bold transition-all group"
            style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
            {tab === 'buyer' ? 'মার্কেটপ্লেস দেখুন' : 'শিল্পী হিসেবে যোগ দিন'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
