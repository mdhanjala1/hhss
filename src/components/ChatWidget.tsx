import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Bot, Loader2, Sparkles,
  RotateCcw, ChevronRight, RefreshCw,
  MessageCircle, Headphones,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const GOLD   = '#c2a06e';
const GOLD_D = 'rgba(194,160,110,0.14)';
const GOLD_B = 'rgba(194,160,110,0.22)';
const WA_NUM = '8801340338401';
const WA_URL = `https://wa.me/${WA_NUM}?text=${encodeURIComponent('আস্সালামু আলাইকুম! শিল্পশপ সম্পর্কে সাহায্য দরকার।')}`;

// VITE env — Cloudflare Dashboard → Pages → Settings → Environment Variables
// Variable name: VITE_GROQ_API_KEY
const GROQ_KEY: string = (import.meta as any).env?.VITE_GROQ_API_KEY ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// AI System Prompt — শিল্পশপের সম্পূর্ণ তথ্য
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `তুমি শিল্পশপের (ShilpoShop) অফিসিয়াল কাস্টমার সার্ভিস প্রতিনিধি। তোমার নাম "রাফি"।
তুমি সর্বদা বাংলায় উত্তর দেবে। উত্তর সংক্ষিপ্ত, স্পষ্ট ও বন্ধুত্বপূর্ণ হবে।

━━━━━━━━━━━━━━━━━━━━━━
কঠোর নিয়ম (অবশ্যই মানতে হবে)
━━━━━━━━━━━━━━━━━━━━━━
১. শুধুমাত্র নিচে দেওয়া তথ্যের ভিত্তিতে উত্তর দাও — নিজে থেকে কিছু বানিয়ে বলবে না
২. রিটার্ন, রিফান্ড, পণ্য ফেরত বা ক্ষতিপূরণ সম্পর্কে কোনো তথ্য বা প্রতিশ্রুতি দেবে না
   এই প্রশ্ন আসলে বলবে: "এই বিষয়ে সরাসরি WhatsApp এ জানুন: +880 1340-338401"
৩. যে প্রশ্নের উত্তর নিচে নেই — WhatsApp এ রেফার করবে
৪. কোনো দিন, সময়সীমা বা guarantee দেবে না যদি নিচে উল্লেখ না থাকে
৫. ওয়েবসাইটে যা আছে তাই বলবে — বাড়িয়ে বা কমিয়ে বলবে না

━━━━━━━━━━━━━━━━━━━━━━
শিল্পশপ পরিচিতি
━━━━━━━━━━━━━━━━━━━━━━
বাংলাদেশের একটি অনলাইন আর্ট মার্কেটপ্লেস।
এখানে স্বাধীন বাংলাদেশি শিল্পীরা তাদের শিল্পকর্ম বিক্রি করেন।
পাওয়া যায়: পেইন্টিং, আরবি ক্যালিগ্রাফি, হস্তশিল্প, ডিজিটাল আর্ট, ওয়াটারকালার, স্কেচ, ফটোগ্রাফি।
সকল শিল্পী NID যাচাইকৃত। শিল্পকর্ম ১০০% অরিজিনাল।

━━━━━━━━━━━━━━━━━━━━━━
ওয়েবসাইটের পেইজ
━━━━━━━━━━━━━━━━━━━━━━
হোম (/) — ফিচার্ড শিল্পকর্ম ও hero স্লাইড
মার্কেটপ্লেস (/marketplace) — সব শিল্পকর্ম, ক্যাটাগরি ও মূল্য ফিল্টার
শিল্পীগণ (/artists) — Verified শিল্পীদের তালিকা
কীভাবে ব্যবহার করবেন (/how-it-works) — ক্রেতা ও শিল্পী গাইড
কার্ট (/cart) — কেনাকাটার ঝুড়ি
উইশলিস্ট (/wishlist) — পছন্দের তালিকা
যোগাযোগ (/contact) — সাপোর্ট ফর্ম ও যোগাযোগের তথ্য
লগইন (/login) — অ্যাকাউন্ট তৈরি ও লগইন
শিল্পী ড্যাশবোর্ড (/dashboard) — শিল্পীদের কন্ট্রোল প্যানেল

━━━━━━━━━━━━━━━━━━━━━━
কেনাকাটার প্রক্রিয়া
━━━━━━━━━━━━━━━━━━━━━━
১. মার্কেটপ্লেস থেকে পছন্দের শিল্পকর্ম কার্টে যোগ করুন
২. নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা দিন
৩. অর্ডার কনফার্ম করুন
৪. পণ্য পেয়ে সন্তুষ্ট হলে পেমেন্ট করুন (ক্যাশ অন ডেলিভারি)

━━━━━━━━━━━━━━━━━━━━━━
পেমেন্ট পদ্ধতি
━━━━━━━━━━━━━━━━━━━━━━
• ক্যাশ অন ডেলিভারি (COD) — পণ্য হাতে পেয়ে পেমেন্ট করুন [প্রধান পদ্ধতি]
• bKash — মোবাইল ব্যাংকিং
• Nagad — মোবাইল ব্যাংকিং
• Rocket — মোবাইল ব্যাংকিং

━━━━━━━━━━━━━━━━━━━━━━
ডেলিভারি তথ্য
━━━━━━━━━━━━━━━━━━━━━━
• ঢাকার মধ্যে: সাধারণত ২–৩ কার্যদিবস
• ঢাকার বাইরে: সাধারণত ৩–৫ কার্যদিবস
• সারা বাংলাদেশে ডেলিভারি হয়
• ডেলিভারি চার্জ অর্ডার করার সময় দেখানো হয়

━━━━━━━━━━━━━━━━━━━━━━
শিল্পী হওয়ার প্রক্রিয়া
━━━━━━━━━━━━━━━━━━━━━━
১. /login পেইজে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন
২. ড্যাশবোর্ড থেকে NID তথ্য ও ছবি জমা দিন
৩. Admin যাচাই করলে "Verified Artist" ব্যাজ পাবেন
৪. শিল্পকর্মের ছবি, বিবরণ ও মূল্য দিয়ে আপলোড করুন
৫. অনুমোদনের পর শিল্পকর্ম প্রকাশিত হবে
৬. অর্ডার পেলে নিশ্চিত করুন ও পণ্য ডেলিভারি দিন

━━━━━━━━━━━━━━━━━━━━━━
কাস্টম অর্ডার
━━━━━━━━━━━━━━━━━━━━━━
• বিশেষ উপলক্ষ বা উপহারের জন্য কাস্টম শিল্পকর্ম অর্ডার করা যায়
• পছন্দের শিল্পীর প্রোফাইল পেইজ থেকে সরাসরি যোগাযোগ করুন
• বিস্তারিত জানতে WhatsApp: +880 1340-338401 

━━━━━━━━━━━━━━━━━━━━━━
যোগাযোগ
━━━━━━━━━━━━━━━━━━━━━━
• WhatsApp: +880 1340-338401 (সবচেয়ে দ্রুত সাড়া)
• ইমেইল: shilposhop.com@gmail.com, blog.alfamito@gmail.com
• সাপোর্ট সময়: সকাল ৯টা — রাত ১০টা, সপ্তাহে ৭ দিন

━━━━━━━━━━━━━━━━━━━━━━
এই প্রশ্নগুলোতে শুধু WhatsApp রেফার করবে
━━━━━━━━━━━━━━━━━━━━━━
• রিটার্ন, রিফান্ড বা পণ্য ফেরত সংক্রান্ত যেকোনো প্রশ্ন
• অর্ডার বাতিল বা পরিবর্তন
• পেমেন্ট সমস্যা বা বিরোধ
• ডেলিভারি বিলম্ব বা পণ্য না পাওয়া
• শিল্পীর সাথে যেকোনো বিবাদ বা অভিযোগ
• যেকোনো জরুরি সমস্যা
• উপরে উল্লেখ নেই এমন যেকোনো প্রশ্ন`;


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

type View = 'closed' | 'launcher' | 'chat';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const ts  = () => new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const QUICK_Q = [
  { e: '📦', l: 'ডেলিভারি কতদিন?',     q: 'ডেলিভারি কতদিনের মধ্যে পাবো এবং চার্জ কত?' },
  { e: '💳', l: 'পেমেন্ট পদ্ধতি?',      q: 'কোন কোন পদ্ধতিতে পেমেন্ট করা যায়?' },
  { e: '🎨', l: 'শিল্পী হতে চাই',        q: 'শিল্পী হিসেবে কিভাবে যোগ দেবো? ধাপগুলো বলুন।' },
  { e: '🖼️', l: 'কাস্টম অর্ডার',       q: 'কাস্টম আর্টওয়ার্ক অর্ডার করতে চাই, কিভাবে করবো?' },
  { e: '📍', l: 'অর্ডার ট্র্যাকিং',     q: 'আমার অর্ডার কিভাবে ট্র্যাক করবো?' },
  { e: '🆘', l: 'সমস্যা হয়েছে',          q: 'আমার একটি সমস্যা হয়েছে, সাহায্য দরকার।' },
  { e: '👤', l: 'NID যাচাই',             q: 'NID যাচাই কিভাবে করতে হয়?' },
  { e: '🛒', l: 'কিভাবে কিনবো?',         q: 'শিল্পশপ থেকে কিভাবে শিল্পকর্ম কিনতে পারবো?' },
];

const WELCOME: Msg = {
  id: 'welcome',
  role: 'assistant',
  time: ts(),
  content: 'আস্সালামু আলাইকুম! কেমন আছেন? 😊\n\nআমি **রাফি**, শিল্পশপের সাপোর্ট টিম থেকে কথা বলছি। শিল্পকর্ম কেনা, অর্ডার, পেমেন্ট, ডেলিভারি বা শিল্পী হওয়া — যেকোনো বিষয়ে আপনাকে সাহায্য করতে পারবো।\n\nকী নিয়ে কথা বলতে চান? নিচে বেছে নিন বা সরাসরি লিখুন!',
};

// ─────────────────────────────────────────────────────────────────────────────
// Groq API call
// ─────────────────────────────────────────────────────────────────────────────
type ErrCode = 'NO_KEY' | 'BAD_KEY' | 'RATE_LIMIT' | 'TIMEOUT' | 'NETWORK' | 'EMPTY';

async function groqChat(history: Msg[]): Promise<string> {
  if (!GROQ_KEY || GROQ_KEY.length < 10) throw Object.assign(new Error(), { code: 'NO_KEY' as ErrCode });

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-14).map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 600,
        temperature: 0.45,
      }),
      signal: ctrl.signal,
    });

    clearTimeout(timer);
    if (res.status === 401) throw Object.assign(new Error(), { code: 'BAD_KEY'    as ErrCode });
    if (res.status === 429) throw Object.assign(new Error(), { code: 'RATE_LIMIT' as ErrCode });
    if (!res.ok)            throw Object.assign(new Error(), { code: 'NETWORK'    as ErrCode });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw Object.assign(new Error(), { code: 'EMPTY' as ErrCode });
    return text;
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.code) throw e;
    const msg: string = e?.message ?? '';
    if (msg.toLowerCase().includes('abort')) throw Object.assign(new Error(), { code: 'TIMEOUT'  as ErrCode });
    throw Object.assign(new Error(), { code: 'NETWORK' as ErrCode });
  }
}

const ERR_MSG: Record<ErrCode, string> = {
  NO_KEY:     '⚙️ AI সেটআপ সম্পন্ন হয়নি। সরাসরি WhatsApp এ যোগাযোগ করুন: +880 1340-338401',
  BAD_KEY:    '🔑 API key সমস্যা আছে। WhatsApp এ যোগাযোগ করুন: +880 1340-338401',
  RATE_LIMIT: '⏳ এই মুহূর্তে একটু চাপ বেশি। ৩০ সেকেন্ড পর আবার চেষ্টা করুন অথবা WhatsApp করুন।',
  TIMEOUT:    '⏱️ সার্ভার সাড়া দিতে দেরি হচ্ছে। একটু পরে আবার চেষ্টা করুন।',
  NETWORK:    '📡 সংযোগে সমস্যা হয়েছে। ইন্টারনেট চেক করে আবার চেষ্টা করুন।',
  EMPTY:      '🤔 উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন অথবা WhatsApp করুন।',
};

// ─────────────────────────────────────────────────────────────────────────────
// Bold text renderer
// ─────────────────────────────────────────────────────────────────────────────
function Txt({ s }: { s: string }) {
  return (
    <>
      {s.split('\n').map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((c, ci) =>
            c.startsWith('**') && c.endsWith('**')
              ? <strong key={ci} style={{ color: GOLD, fontWeight: 700 }}>{c.slice(2, -2)}</strong>
              : <span key={ci}>{c}</span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────
function Bubble({ m }: { m: Msg }) {
  const bot = m.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${bot ? '' : 'flex-row-reverse'}`}
    >
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
        style={bot
          ? { background: `linear-gradient(135deg,${GOLD},#9a6e35)` }
          : { background: GOLD_D, border: `1px solid ${GOLD_B}` }}>
        {bot
          ? <Bot style={{ width: 13, height: 13, color: '#1a0e05' }} />
          : <span style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>আ</span>}
      </div>
      <div className={`flex flex-col gap-0.5 max-w-[80%] ${bot ? '' : 'items-end'}`}>
        <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={bot
            ? { background: 'var(--card,#231508)', border: `1px solid ${GOLD_B}`, color: 'var(--text,#e8d5bb)', borderTopLeftRadius: 5 }
            : { background: `linear-gradient(135deg,${GOLD},#9a6e35)`, color: '#1a0e05', fontWeight: 500, borderTopRightRadius: 5 }}>
          {bot ? <Txt s={m.content} /> : m.content}
        </div>
        <span style={{ fontSize: 10, color: 'rgba(194,160,110,0.35)', padding: '0 4px' }}>{m.time}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────
function Typing() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg,${GOLD},#9a6e35)` }}>
        <Bot style={{ width: 13, height: 13, color: '#1a0e05' }} />
      </div>
      <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: 'var(--card,#231508)', border: `1px solid ${GOLD_B}`, borderTopLeftRadius: 5 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.65, delay: i * 0.13, repeat: Infinity }} />
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp SVG Icon
// ─────────────────────────────────────────────────────────────────────────────
function WaIcon({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: color, flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({ onClose }: { onClose: () => void }) {
  const [msgs,    setMsgs]    = useState<Msg[]>([WELCOME]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showQ,   setShowQ]   = useState(true);
  const [errCode, setErrCode] = useState<ErrCode | null>(null);
  const [lastQ,   setLastQ]   = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setShowQ(false);
    setErrCode(null);
    setLastQ(q);

    const userMsg: Msg = { id: uid(), role: 'user', content: q, time: ts() };
    const updated = [...msgs, userMsg];
    setMsgs(updated);
    setInput('');
    setLoading(true);

    try {
      const reply = await groqChat(updated);
      setMsgs(p => [...p, { id: uid(), role: 'assistant', content: reply, time: ts() }]);
    } catch (e: any) {
      const code: ErrCode = e?.code ?? 'NETWORK';
      setErrCode(code);
      setMsgs(p => [...p, { id: uid(), role: 'assistant', content: ERR_MSG[code], time: ts() }]);
    } finally {
      setLoading(false);
    }
  }, [msgs, loading]);

  const retry = useCallback(() => {
    if (!lastQ || loading) return;
    setMsgs(p => p.slice(0, -1));
    setErrCode(null);
    setTimeout(() => send(lastQ), 80);
  }, [lastQ, loading, send]);

  const reset = () => { setMsgs([WELCOME]); setShowQ(true); setErrCode(null); setInput(''); setLastQ(''); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col overflow-hidden rounded-3xl"
      style={{
        width: 'min(390px, calc(100vw - 20px))',
        height: 'min(640px, calc(100dvh - 88px))',
        background: 'var(--bg,#1a0e05)',
        border: `1px solid ${GOLD_B}`,
        boxShadow: `0 32px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(194,160,110,0.06)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#1e0f06,#2d1808)', borderBottom: `1px solid ${GOLD_B}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg,${GOLD},#9a6e35)` }}>
          <Sparkles style={{ width: 17, height: 17, color: '#1a0e05' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: GOLD }}>রাফি — শিল্পশপ সাপোর্ট</span>
            <span className="flex items-center gap-1">
              <motion.span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span style={{ color: '#22c55e', fontSize: 10 }}>এখন অনলাইন</span>
            </span>
          </div>
          <p style={{ color: 'rgba(194,160,110,0.45)', fontSize: 11 }}>সাধারণত কয়েক সেকেন্ডের মধ্যে সাড়া দেই</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={reset} title="নতুন কথোপকথন"
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(194,160,110,0.4)' }}>
            <RotateCcw style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(194,160,110,0.4)' }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${GOLD_B} transparent` }}>
        {msgs.map(m => <Bubble key={m.id} m={m} />)}
        <AnimatePresence>{loading && <Typing />}</AnimatePresence>

        {/* Error actions */}
        <AnimatePresence>
          {errCode && !loading && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex gap-2 flex-wrap">
              {errCode !== 'NO_KEY' && errCode !== 'BAD_KEY' && (
                <button onClick={retry}
                  className="flex items-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: GOLD_D, border: `1px solid ${GOLD_B}`, color: GOLD }}>
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  আবার চেষ্টা করুন
                </button>
              )}
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: '#25D366', color: '#fff' }}>
                <WaIcon size={13} />
                WhatsApp করুন
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <AnimatePresence>
        {showQ && msgs.length <= 1 && !loading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 px-3 pt-2.5 pb-2"
            style={{ borderTop: `1px solid ${GOLD_B}`, background: 'var(--bg,#1a0e05)' }}>
            <p className="text-xs mb-2 px-1 font-semibold uppercase tracking-wider" style={{ color: 'rgba(194,160,110,0.45)' }}>
              সাধারণ প্রশ্নসমূহ
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_Q.map(({ e, l, q }) => (
                <button key={l} onClick={() => send(q)} disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                  style={{ background: GOLD_D, border: `1px solid ${GOLD_B}`, color: GOLD }}>
                  <span style={{ flexShrink: 0 }}>{e}</span>
                  <span className="truncate flex-1">{l}</span>
                  <ChevronRight style={{ width: 10, height: 10, flexShrink: 0, opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${GOLD_B}`, background: 'var(--bg,#1a0e05)' }}>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
          placeholder="আপনার প্রশ্ন লিখুন..."
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--card,#231508)',
            border: `1.5px solid ${input ? GOLD : GOLD_B}`,
            color: 'var(--text,#e8d5bb)',
            caretColor: GOLD,
            transition: 'border-color 0.18s',
          }} />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: input.trim() && !loading ? `linear-gradient(135deg,${GOLD},#9a6e35)` : GOLD_D }}>
          {loading
            ? <Loader2 style={{ width: 15, height: 15, color: GOLD }} className="animate-spin" />
            : <Send style={{ width: 14, height: 14, color: input.trim() ? '#1a0e05' : GOLD }} />}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-1.5 text-xs flex-shrink-0"
        style={{ color: 'rgba(194,160,110,0.2)', borderTop: `1px solid ${GOLD_B}`, letterSpacing: '0.03em' }}>
        শিল্পশপ কাস্টমার সার্ভিস
      </div>
    </motion.div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Main SupportHub — দুটো বাটন সবসময় দৃশ্যমান: WhatsApp + AI Chat
// ─────────────────────────────────────────────────────────────────────────────
export default function SupportHub() {
  const [chatOpen, setChatOpen] = useState(false);
  const [unread,   setUnread]   = useState(0);

  return (
    <>
      {/* ── AI Chat Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            <ChatPanel onClose={() => setChatOpen(false)} />
            {/* Close button */}
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setChatOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-2xl px-4 py-2.5 ml-auto"
              style={{
                background: 'linear-gradient(135deg,#3a2010,#4a2a14)',
                border: `1px solid ${GOLD_B}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <X style={{ width: 15, height: 15, color: GOLD }} />
              <span style={{ color: GOLD, fontWeight: 600, fontSize: 12 }}>বন্ধ করুন</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── দুটো floating বাটন — chat বন্ধ থাকলে দেখাবে ────────────────── */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">

          {/* WhatsApp বাটন */}
          <motion.a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3 relative"
            style={{
              background: 'linear-gradient(135deg,#25d366,#128c7e)',
              boxShadow: '0 6px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.25)',
              textDecoration: 'none',
            }}
          >
            <WaIcon size={19} color="#fff" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13.5 }}>
              WhatsApp
            </span>
            {/* pulse */}
            <motion.span
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              style={{ border: '2px solid #25d366' }}
            />
          </motion.a>

          {/* AI Chat বাটন */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => { setChatOpen(true); setUnread(0); }}
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3 relative"
            style={{
              background: `linear-gradient(135deg,${GOLD},#9a6e35)`,
              boxShadow: `0 6px 24px rgba(194,160,110,0.5), 0 2px 8px rgba(0,0,0,0.25)`,
            }}
          >
            <MessageCircle style={{ width: 19, height: 19, color: '#1a0e05' }} />
            <span style={{ color: '#1a0e05', fontWeight: 700, fontSize: 13.5 }}>
              সাহায্য দরকার?
            </span>
            {/* unread badge */}
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
            {/* pulse */}
            <motion.span
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ scale: [1, 1.14, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              style={{ border: `2px solid ${GOLD}` }}
            />
          </motion.button>

        </div>
      )}
    </>
  );
}
