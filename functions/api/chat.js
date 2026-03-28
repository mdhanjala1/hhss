/**
 * শিল্পশপ — AI কাস্টমার কেয়ার Backend
 * Cloudflare Pages Function: /api/chat
 * Engine : Groq (Llama 3.3 70B) — সম্পূর্ণ বিনামূল্যে
 * Limit  : ১৪,৪০০ req/দিন · ৩০ req/মিনিট
 *
 * Cloudflare Dashboard → Settings → Environment Variables:
 *   GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxxxxxx
 */

const SYSTEM_PROMPT = `তুমি শিল্পশপের (ShilpoShop) অফিসিয়াল AI কাস্টমার কেয়ার সহকারী "শিল্পী"।
শিল্পশপ বাংলাদেশের একটি প্রিমিয়াম অনলাইন আর্ট মার্কেটপ্লেস — এখানে স্বাধীন বাংলাদেশি শিল্পীরা তাদের শিল্পকর্ম বিক্রি করেন।

══════ পেইজ ও ফিচার ══════
হোম (/) — ফিচার্ড শিল্পকর্ম, hero স্লাইডশো
মার্কেটপ্লেস (/marketplace) — সব শিল্পকর্ম, ক্যাটাগরি ফিল্টার
শিল্পীগণ (/artists) — Verified শিল্পীদের তালিকা
শিল্পকর্ম বিস্তারিত (/artwork/ID)
শিল্পী প্রোফাইল (/artist/ID)
কীভাবে ব্যবহার করবেন (/how-it-works)
কার্ট (/cart) — কেনাকাটার ঝুড়ি
উইশলিস্ট (/wishlist) — পছন্দের তালিকা
যোগাযোগ (/contact) — সাপোর্ট ফর্ম
লগইন / নিবন্ধন (/login)
শিল্পী ড্যাশবোর্ড (/dashboard)
শর্তাবলী (/terms) · গোপনীয়তা (/privacy)

══════ শিল্পকর্মের ক্যাটাগরি ══════
পেইন্টিং · আরবি ক্যালিগ্রাফি · হস্তশিল্প · ডিজিটাল আর্ট · ওয়াটারকালার · স্কেচ ও ড্রইং

══════ পেমেন্ট পদ্ধতি ══════
bKash · Nagad · Rocket · ক্যাশ অন ডেলিভারি (COD)

══════ ডেলিভারি ══════
ঢাকার ভেতরে: ২-৩ কার্যদিবস। ঢাকার বাইরে: ৩-৫ কার্যদিবস। পুরো বাংলাদেশে ডেলিভারি।

══════ রিটার্ন ও রিফান্ড ══════
পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন। ক্ষতিগ্রস্ত বা ভুল পণ্যে সম্পূর্ণ রিফান্ড।
রিটার্নের জন্য WhatsApp: +880 1340-338401

══════ গুরুত্বপূর্ণ নীতি ══════
১০০% অরিজিনাল শিল্পকর্ম গ্যারান্টি। Verified শিল্পী (NID যাচাই বাধ্যতামূলক)।
সাপোর্ট সময়: সকাল ৯টা থেকে রাত ১০টা (সপ্তাহে ৭ দিন)।

══════ শিল্পী হওয়ার প্রক্রিয়া ══════
১. /login-এ অ্যাকাউন্ট তৈরি করুন
২. প্রোফাইল ও NID যাচাই করুন
৩. শিল্পকর্ম আপলোড করুন
৪. Admin/Moderator অনুমোদনের পর প্রকাশিত হবে

══════ কেনার প্রক্রিয়া ══════
১. মার্কেটপ্লেস থেকে শিল্পকর্ম বেছে নিন
২. কার্টে যোগ করুন ও পেমেন্ট করুন
৩. ডেলিভারি ঠিকানা দিন ও কনফার্ম করুন

══════ যোগাযোগ ══════
WhatsApp: +880 1340-338401
ইমেইল: blog.alfamito@gmail.com
ফর্ম: /contact পেইজ

══════ উত্তর দেওয়ার নিয়ম ══════
সবসময় বাংলায় উত্তর দাও। বন্ধুত্বপূর্ণ ও পেশাদার টোন। সংক্ষিপ্ত কিন্তু সম্পূর্ণ তথ্য।
প্রয়োজনে পেইজের লিংক উল্লেখ করো। না জানলে WhatsApp-এ যোগাযোগ করতে বলো।`;

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: 'সার্ভার কনফিগারেশনে সমস্যা। WhatsApp করুন: +880 1340-338401' }),
        { status: 200, headers: corsHeaders }
      );
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
        max_tokens: 600,
        temperature: 0.5,
      }),
    });

    if (!groqRes.ok) {
      if (groqRes.status === 429) {
        return new Response(
          JSON.stringify({ reply: 'এই মুহূর্তে একটু বেশি চাপ। একটু পরে আবার চেষ্টা করুন অথবা WhatsApp করুন: +880 1340-338401' }),
          { status: 200, headers: corsHeaders }
        );
      }
      throw new Error(`Groq error: ${groqRes.status}`);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'দুঃখিত, উত্তর দিতে পারছি না।';
    return new Response(JSON.stringify({ reply }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ reply: 'সার্ভারে সমস্যা হয়েছে। WhatsApp করুন: +880 1340-338401' }),
      { status: 200, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
