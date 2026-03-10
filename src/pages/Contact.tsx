import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const W = '#c2a06e';
const WD = '#1a0e05';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [dbError, setDbError] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('সবগুলো তারকা চিহ্নিত ঘর পূরণ করুন');
      return;
    }
    setLoading(true);
    setDbError(false);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name, email: form.email, phone: form.phone,
        subject: form.subject, message: form.message, is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Contact message error:', error);
        // Table doesn't exist yet
        if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          setDbError(true);
          setSent(true); // Show success with WhatsApp fallback
        } else {
          throw error;
        }
      } else {
        setSent(true);
      }
    } catch (e: any) {
      toast.error('বার্তা পাঠানো যায়নি। WhatsApp বা ইমেইলে যোগাযোগ করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(194,160,110,0.15)', color: W }}>যোগাযোগ</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>আমাদের সাথে কথা বলুন</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text2)' }}>যেকোনো প্রশ্ন, পরামর্শ বা সহায়তার জন্য আমরা সর্বদা আপনার পাশে আছি।</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info cards */}
          <div className="space-y-5">
            {[
              { icon: <MessageCircle className="w-6 h-6" />, title: 'WhatsApp সাপোর্ট', desc: 'সবচেয়ে দ্রুত সাড়া পেতে WhatsApp করুন', info: '+880 1340-338401', link: 'https://wa.me/8801340338401' },
              { icon: <Mail className="w-6 h-6" />, title: 'ইমেইল', desc: 'বিস্তারিত প্রশ্নের জন্য ইমেইল করুন', info: 'blog.alfamito@gmail.com', link: 'mailto:blog.alfamito@gmail.com' },
              { icon: <Clock className="w-6 h-6" />, title: 'সাপোর্ট সময়', desc: 'আমাদের টিম সপ্তাহে ৭ দিন আছে', info: 'সকাল ৯টা — রাত ১০টা', link: null },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(194,160,110,0.12)', color: W }}>
                  {c.icon}
                </div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{c.title}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text2)' }}>{c.desc}</p>
                {c.link
                  ? <a href={c.link} target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:underline" style={{ color: W }}>{c.info}</a>
                  : <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{c.info}</p>
                }
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl border shadow-sm p-12 text-center h-full flex flex-col items-center justify-center"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(194,160,110,0.15)' }}>
                  {dbError
                    ? <AlertCircle className="w-10 h-10" style={{ color: '#e08040' }} />
                    : <CheckCircle className="w-10 h-10" style={{ color: W }} />
                  }
                </div>
                {dbError ? (
                  <>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>ডেটাবেস প্রস্তুত নেই</h2>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text2)' }}>
                      Admin এখনো <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(194,160,110,0.2)' }}>contact_messages</code> টেবিল তৈরি করেননি।
                    </p>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text2)' }}>
                      এখনই WhatsApp বা ইমেইলে যোগাযোগ করুন:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="https://wa.me/8801340338401" target="_blank" rel="noopener noreferrer"
                        className="px-6 py-3 text-white rounded-2xl font-bold"
                        style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
                        WhatsApp করুন
                      </a>
                      <a href="mailto:blog.alfamito@gmail.com"
                        className="px-6 py-3 rounded-2xl font-bold border"
                        style={{ color: W, borderColor: W }}>
                        ইমেইল করুন
                      </a>
                    </div>
                    <p className="text-xs mt-6 p-3 rounded-xl" style={{ background: 'rgba(194,160,110,0.1)', color: 'var(--text2)' }}>
                      Admin: Supabase-এ <strong>contact_table.sql</strong> রান করুন (ZIP-এ আছে)
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>বার্তা পাঠানো হয়েছে! ✅</h2>
                    <p className="leading-relaxed" style={{ color: 'var(--text2)' }}>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
                    <button onClick={() => { setSent(false); setDbError(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                      className="mt-8 px-6 py-3 text-white rounded-2xl font-bold hover:opacity-90 transition-all"
                      style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
                      নতুন বার্তা পাঠান
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="rounded-3xl border shadow-sm p-8"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>বার্তা পাঠান</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {[
                    { k: 'name', label: 'আপনার নাম *', type: 'text', ph: 'পূর্ণ নাম' },
                    { k: 'email', label: 'ইমেইল *', type: 'email', ph: 'email@example.com' },
                    { k: 'phone', label: 'ফোন নম্বর', type: 'tel', ph: '01XXXXXXXXX' },
                  ].map(({ k, label, type, ph }) => (
                    <div key={k}>
                      <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text)' }}>{label}</label>
                      <input type={type} placeholder={ph} value={(form as any)[k]} onChange={e => set(k, e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl outline-none text-sm"
                        style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
                        onFocus={e => e.target.style.borderColor = W}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text)' }}>বিষয় *</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}>
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {['অর্ডার সংক্রান্ত','ডেলিভারি সমস্যা','রিটার্ন/রিফান্ড','শিল্পী অ্যাকাউন্ট','পেমেন্ট সংক্রান্ত','অন্যান্য'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text)' }}>আপনার বার্তা *</label>
                  <textarea rows={5} placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..." value={form.message} onChange={e => set('message', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl outline-none text-sm resize-none"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
                    onFocus={e => e.target.style.borderColor = W}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold transition-all disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg,${W},#8b6914)` }}>
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
