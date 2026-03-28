import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Bot, Loader2, MessageCircle,
  Sparkles, RotateCcw, ChevronRight, Minimize2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const GOLD        = '#c2a06e';
const GOLD_DIM    = 'rgba(194,160,110,0.15)';
const GOLD_BORDER = 'rgba(194,160,110,0.22)';
const WA_LINK     = 'https://wa.me/8801340338401?text=শিল্পশপ সম্পর্কে জানতে চাই';

const QUICK = [
  { emoji: '📦', label: 'ডেলিভারি কতদিন?',    q: 'ডেলিভারি কতদিনের মধ্যে পাবো?' },
  { emoji: '💳', label: 'পেমেন্ট কিভাবে?',     q: 'পেমেন্ট কিভাবে করতে হয়?' },
  { emoji: '🔄', label: 'রিটার্ন পলিসি?',       q: 'রিটার্ন ও রিফান্ড পলিসি কি?' },
  { emoji: '🎨', label: 'শিল্পী হতে চাই',       q: 'কিভাবে শিল্পী হিসেবে যোগ দেবো?' },
  { emoji: '🖼️', label: 'কাস্টম আর্টওয়ার্ক', q: 'কাস্টম আর্টওয়ার্ক অর্ডার করতে চাই' },
  { emoji: '📍', label: 'অর্ডার ট্র্যাক',       q: 'আমার অর্ডার কিভাবে ট্র্যাক করবো?' },
  { emoji: '🆘', label: 'অর্ডার সমস্যা',        q: 'আমার অর্ডারে সমস্যা হয়েছে' },
  { emoji: '👤', label: 'NID যাচাই',            q: 'NID যাচাই কিভাবে করবো?' },
];

function getTime() {
  return new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
}

const WELCOME: Message = {
  id: 'w0',
  role: 'assistant',
  content: 'আস্সালামু আলাইকুম! 🎨\n\nআমি **শিল্পী**, শিল্পশপের AI সহকারী। ডেলিভারি, পেমেন্ট, রিটার্ন বা শিল্পী নিবন্ধন — যেকোনো প্রশ্নে সাহায্য করতে প্রস্তুত।\n\nনিচে থেকে বিষয় বেছে নিন বা সরাসরি লিখুন!',
  time: getTime(),
};

function RenderContent({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((chunk, ci) =>
            chunk.startsWith('**') && chunk.endsWith('**') ? (
              <strong key={ci} style={{ color: GOLD, fontWeight: 700 }}>
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              <span key={ci}>{chunk}</span>
            )
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const isBot = msg.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow mt-0.5"
        style={
          isBot
            ? { background: `linear-gradient(135deg,${GOLD},#9a6e35)` }
            : { background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }
        }
      >
        {isBot
          ? <Bot style={{ width: 13, height: 13, color: '#1a0e05' }} />
          : <span style={{ fontSize: 11, color: GOLD }}>আ</span>}
      </div>
      <div className={`flex flex-col gap-0.5 max-w-[80%] ${isBot ? '' : 'items-end'}`}>
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={
            isBot
              ? {
                  background: 'var(--card,#231508)',
                  border: `1px solid ${GOLD_BORDER}`,
                  color: 'var(--text,#e8d5bb)',
                  borderTopLeftRadius: 5,
                }
              : {
                  background: `linear-gradient(135deg,${GOLD},#9a6e35)`,
                  color: '#1a0e05',
                  borderTopRightRadius: 5,
                  fontWeight: 500,
                }
          }
        >
          {isBot ? <RenderContent text={msg.content} /> : msg.content}
        </div>
        <span style={{ fontSize: 10, color: 'rgba(194,160,110,0.4)', paddingInline: 4 }}>
          {msg.time}
        </span>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2"
    >
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow"
        style={{ background: `linear-gradient(135deg,${GOLD},#9a6e35)` }}
      >
        <Bot style={{ width: 13, height: 13, color: '#1a0e05' }} />
      </div>
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: 'var(--card,#231508)', border: `1px solid ${GOLD_BORDER}`, borderTopLeftRadius: 5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.7, delay: i * 0.14, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([WELCOME]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [unread,    setUnread]    = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const [hasError,  setHasError]  = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [open, minimized]);

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;

    setShowQuick(false);
    setHasError(false);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: t, time: getTime() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const payload = history.slice(-14).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply || 'দুঃখিত, উত্তর পেতে সমস্যা হচ্ছে।';

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, time: getTime() },
      ]);
      if (!open || minimized) setUnread((u) => u + 1);
    } catch {
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা **WhatsApp** এ যোগাযোগ করুন।',
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, open, minimized]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setShowQuick(true);
    setHasError(false);
    setInput('');
  };

  const isFirstMsg = messages.length <= 1;

  return (
    <>
      {/* ── FAB ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-2xl"
            style={{
              background: `linear-gradient(135deg,${GOLD} 0%,#9a6e35 100%)`,
              boxShadow: `0 8px 30px rgba(194,160,110,0.5), 0 2px 8px rgba(0,0,0,0.35)`,
            }}
          >
            <MessageCircle style={{ width: 19, height: 19, color: '#1a0e05' }} />
            <span style={{ color: '#1a0e05', fontWeight: 700, fontSize: 13.5 }}>সাহায্য দরকার?</span>
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
            <motion.span
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              style={{ border: `2px solid ${GOLD}` }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-6 z-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
            style={{
              width: 'min(385px, calc(100vw - 24px))',
              height: minimized ? 'auto' : 'min(620px, calc(100vh - 90px))',
              background: 'var(--bg,#1a0e05)',
              border: `1px solid ${GOLD_BORDER}`,
              boxShadow: `0 30px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(194,160,110,0.08)`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0 cursor-pointer select-none"
              style={{ background: 'linear-gradient(135deg,#1e0f06,#2b1607)', borderBottom: minimized ? 'none' : `1px solid ${GOLD_BORDER}` }}
              onClick={() => setMinimized(m => !m)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD},#9a6e35)` }}
              >
                <Sparkles style={{ width: 17, height: 17, color: '#1a0e05' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: GOLD }}>শিল্পী AI সহকারী</span>
                  <span className="flex items-center gap-1">
                    <motion.span
                      style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span style={{ color: '#22c55e', fontSize: 10 }}>সক্রিয়</span>
                  </span>
                </div>
                <p style={{ color: 'rgba(194,160,110,0.5)', fontSize: 11 }}>
                  শিল্পশপ • ২৪/৭ AI সাপোর্ট • Groq Powered
                </p>
              </div>
              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setMinimized(m => !m)}
                  title={minimized ? 'বড় করুন' : 'ছোট করুন'}
                  className="p-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(194,160,110,0.5)' }}
                >
                  <Minimize2 style={{ width: 14, height: 14 }} />
                </button>
                <button
                  onClick={reset}
                  title="নতুন কথোপকথন"
                  className="p-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(194,160,110,0.45)' }}
                >
                  <RotateCcw style={{ width: 14, height: 14 }} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(194,160,110,0.45)' }}
                >
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>

            {/* Body — hidden when minimized */}
            {!minimized && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: `${GOLD_BORDER} transparent` }}
                >
                  {messages.map((m) => <Bubble key={m.id} msg={m} />)}
                  <AnimatePresence>{loading && <TypingDots />}</AnimatePresence>

                  {hasError && (
                    <motion.a
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      href={WA_LINK} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl py-2.5 px-4 text-sm font-bold hover:opacity-90"
                      style={{ background: '#25D366', color: '#fff' }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#fff' }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp এ যোগাযোগ করুন
                    </motion.a>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick Questions */}
                <AnimatePresence>
                  {showQuick && isFirstMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ borderTop: `1px solid ${GOLD_BORDER}`, background: 'var(--bg,#1a0e05)' }}
                      className="flex-shrink-0 px-3 pt-2.5 pb-2"
                    >
                      <p className="text-xs mb-2 px-1 font-semibold"
                         style={{ color: 'rgba(194,160,110,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        সাধারণ প্রশ্নসমূহ
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {QUICK.map(({ emoji, label, q }) => (
                          <button
                            key={label}
                            onClick={() => send(q)}
                            disabled={loading}
                            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                            style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
                          >
                            <span>{emoji}</span>
                            <span className="truncate">{label}</span>
                            <ChevronRight style={{ width: 10, height: 10, flexShrink: 0, marginLeft: 'auto', opacity: 0.5 }} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input */}
                <div
                  className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
                  style={{ borderTop: `1px solid ${GOLD_BORDER}`, background: 'var(--bg,#1a0e05)' }}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'var(--card,#231508)',
                      border: `1.5px solid ${input ? GOLD : GOLD_BORDER}`,
                      color: 'var(--text,#e8d5bb)',
                      caretColor: GOLD,
                    }}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{
                      background: input.trim() && !loading
                        ? `linear-gradient(135deg,${GOLD},#9a6e35)`
                        : GOLD_DIM,
                    }}
                  >
                    {loading
                      ? <Loader2 style={{ width: 15, height: 15, color: GOLD }} className="animate-spin" />
                      : <Send style={{ width: 14, height: 14, color: input.trim() ? '#1a0e05' : GOLD }} />}
                  </button>
                </div>

                {/* Footer */}
                <div
                  className="text-center py-1.5 text-xs flex-shrink-0"
                  style={{ color: 'rgba(194,160,110,0.25)', borderTop: `1px solid ${GOLD_BORDER}`, letterSpacing: '0.03em' }}
                >
                  শিল্পশপ AI • Llama 3.3 70B via Groq
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
