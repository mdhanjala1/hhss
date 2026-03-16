import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Search, CreditCard, Package, Star, Upload, ShieldCheck, DollarSign, ArrowRight, ChevronDown } from 'lucide-react';

const BUYER_STEPS = [
  { icon: <Search className="w-7 h-7" />, title: 'শিল্পকর্ম খুঁজুন', desc: 'মার্কেটপ্লেস ব্রাউজ করুন। ক্যাটাগরি, মূল্য বা শিল্পী নাম দিয়ে খুঁজুন। পছন্দের শিল্পকর্ম কার্টে যোগ করুন।', step: '০১' },
  { icon: <ShoppingBag className="w-7 h-7" />, title: 'অর্ডার করুন', desc: 'আপনার নাম, ফোন ও ঠিকানা দিয়ে অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারিতে পেমেন্ট করুন — পণ্য পেয়ে তারপর।', step: '০২' },
  { icon: <Package className="w-7 h-7" />, title: 'ডেলিভারি পান', desc: 'শিল্পী আপনার অর্ডার নিশ্চিত করবেন। সারা বাংলাদেশে ডেলিভারি হবে। পণ্য পেয়ে পেমেন্ট করুন।', step: '০৩' },
  { icon: <Star className="w-7 h-7" />, title: 'রিভিউ দিন', desc: 'শিল্পকর্ম পেয়ে আপনার অভিজ্ঞতা শেয়ার করুন। রিভিউ অন্য ক্রেতাদের সাহায্য করে।', step: '০৪' },
];

const ARTIST_STEPS = [
  { icon: <User className="w-7 h-7" />, title: 'অ্যাকাউন্ট তৈরি করুন', desc: 'নাম, ইমেইল ও পাসওয়ার্ড দিয়ে বিনামূল্যে অ্যাকাউন্ট খুলুন। প্রোফাইল ছবি যোগ করুন।', step: '০১' },
  { icon: <ShieldCheck className="w-7 h-7" />, title: 'NID যাচাই করুন', desc: 'ড্যাশবোর্ড থেকে NID কার্ডের তথ্য ও ছবি জমা দিন। এডমিন যাচাই করলে Verified ব্যাজ পাবেন।', step: '০২' },
  { icon: <Upload className="w-7 h-7" />, title: 'শিল্পকর্ম আপলোড করুন', desc: 'ড্যাশবোর্ড থেকে শিল্পকর্মের ছবি, বিবরণ ও মূল্য যোগ করুন। এডমিন অনুমোদন করলে মার্কেটপ্লেসে দেখাবে।', step: '০৩' },
  { icon: <DollarSign className="w-7 h-7" />, title: 'অর্ডার পান ও আয় করুন', desc: 'ক্রেতা অর্ডার করলে নোটিফিকেশন পাবেন। অর্ডার নিশ্চিত করুন এবং পণ্য পৌঁছে দিন।', step: '০৪' },
];

const DASHBOARD_FEATURES = [
  { title: 'ওভারভিউ', desc: 'আয়, বিক্রয় ও অর্ডারের সারাংশ দেখুন' },
  { title: 'শিল্পকর্ম', desc: 'আপলোড করা সব শিল্পকর্ম ম্যানেজ করুন, এডিট বা মুছুন' },
  { title: 'অর্ডার', desc: 'নতুন অর্ডার দেখুন, নিশ্চিত করুন ও স্ট্যাটাস আপডেট করুন' },
  { title: 'আয়', desc: 'মাসিক আয়ের বিবরণ ও বিশ্লেষণ দেখুন' },
  { title: 'নোটিফিকেশন', desc: 'অর্ডার ও এডমিনের বার্তা দেখুন' },
  { title: 'সেটিংস', desc: 'প্রোফাইল, ফোন ও সোশ্যাল লিংক আপডেট করুন' },
];

export default function HowItWorks() {
  const [tab, setTab] = useState<'buyer' | 'artist'>('buyer');

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">গাইড</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">শিল্পশপ কীভাবে ব্যবহার করবেন?</h1>
          <p className="text-stone-500 text-lg">ক্রেতা ও শিল্পী উভয়ের জন্য ধাপে ধাপে নির্দেশিকা</p>
        </div>

        {/* Tab */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-stone-200 shadow-sm mb-12 max-w-sm mx-auto">
          {[['buyer','🛍️ ক্রেতা'], ['artist','🎨 শিল্পী']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as any)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === v ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {(tab === 'buyer' ? BUYER_STEPS : ARTIST_STEPS).map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-stone-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">{s.icon}</div>
                </div>
                <div>
                  <div className="text-emerald-500 text-xs font-bold mb-1">{s.step}</div>
                  <h3 className="font-bold text-stone-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard features (artist only) */}
        {tab === 'artist' && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center">ড্যাশবোর্ডের সুবিধাসমূহ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DASHBOARD_FEATURES.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                  <h4 className="font-bold text-emerald-600 mb-2">{f.title}</h4>
                  <p className="text-stone-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-stone-900 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
            {tab === 'buyer' ? 'শুরু করতে প্রস্তুত?' : 'আজই শিল্পী হিসেবে যোগ দিন!'}
          </h2>
          <p className="text-stone-400 mb-8 relative z-10">
            {tab === 'buyer' ? 'হাজারো অনন্য শিল্পকর্ম আপনার জন্য অপেক্ষা করছে।' : 'বিনামূল্যে যোগ দিন এবং আপনার শিল্পকর্ম বিক্রি শুরু করুন।'}
          </p>
          <Link to={tab === 'buyer' ? '/marketplace' : '/login'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all group relative z-10">
            {tab === 'buyer' ? 'মার্কেটপ্লেস দেখুন' : 'অ্যাকাউন্ট তৈরি করুন'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
