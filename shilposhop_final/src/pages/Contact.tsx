import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle, Clock, HeadphonesIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('সবগুলো তারকা চিহ্নিত ঘর পূরণ করুন');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name, email: form.email, phone: form.phone,
        subject: form.subject, message: form.message, is_read: false,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      toast.error('পাঠানো সম্ভব হয়নি: ' + e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">যোগাযোগ</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">আমাদের সাথে কথা বলুন</h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">যেকোনো প্রশ্ন, পরামর্শ বা সহায়তার জন্য আমরা সর্বদা আপনার পাশে আছি।</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info cards */}
          <div className="space-y-5">
            {[
              { icon: <MessageCircle className="w-6 h-6" />, title: 'WhatsApp সাপোর্ট', desc: 'সবচেয়ে দ্রুত সাড়া পেতে WhatsApp করুন', info: '+880 1340-338401', link: 'https://wa.me/8801340338401', color: 'emerald' },
              { icon: <Mail className="w-6 h-6" />, title: 'ইমেইল', desc: 'বিস্তারিত প্রশ্নের জন্য ইমেইল করুন', info: 'blog.alfamito@gmail.com', color: 'blue' },
              { icon: <Clock className="w-6 h-6" />, title: 'সাপোর্ট সময়', desc: 'আমাদের টিম সপ্তাহে ৭ দিন আছে', info: 'সকাল ৯টা — রাত ১০টা', color: 'amber' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  c.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  c.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}>{c.icon}</div>
                <h3 className="font-bold text-stone-900 mb-1">{c.title}</h3>
                <p className="text-stone-400 text-sm mb-2">{c.desc}</p>
                {c.link
                  ? <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold text-sm hover:underline">{c.info}</a>
                  : <p className="text-stone-700 font-semibold text-sm">{c.info}</p>
                }
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-3">বার্তা পাঠানো হয়েছে!</h2>
                <p className="text-stone-500 leading-relaxed">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all">
                  নতুন বার্তা পাঠান
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">বার্তা পাঠান</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">আপনার নাম *</label>
                    <input type="text" placeholder="পূর্ণ নাম" value={form.name} onChange={e => set('name', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">ইমেইল *</label>
                    <input type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">ফোন নম্বর</label>
                    <input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">বিষয় *</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {['অর্ডার সংক্রান্ত','ডেলিভারি সমস্যা','রিটার্ন/রিফান্ড','শিল্পী অ্যাকাউন্ট','পেমেন্ট সংক্রান্ত','অন্যান্য'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-sm font-semibold text-stone-700 block mb-2">আপনার বার্তা *</label>
                  <textarea rows={5} placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..." value={form.message} onChange={e => set('message', e.target.value)}
                    className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" />বার্তা পাঠান</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
