/**
 * শিল্পশপ AI কাস্টমার কেয়ার
 * Cloudflare Pages Function — /api/chat
 *
 * PRIMARY:  Cloudflare Workers AI (Llama 3.3 70B) — বিল্ট-ইন, কোনো API key লাগবে না
 * FALLBACK: Groq API (Llama 3.3 70B) — ফ্রি, প্রতিদিন ১৪,৪০০ request
 */

const SYSTEM_PROMPT = `তুমি শিল্পশপ (ShilpoShop)-এর অফিসিয়াল AI কাস্টমার সহকারী। তোমার নাম "শিল্পী"।
তুমি সর্বদা বাংলায় কথা বলবে — গ্রাহক যে ভাষায়ই লিখুক।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 শিল্পশপ পরিচিতি
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
শিল্পশপ বাংলাদেশের একটি প্রিমিয়াম অনলাইন আর্ট মার্কেটপ্লেস।
বাংলাদেশের প্রতিভাবান শিল্পীরা এখানে তাদের অনন্য শিল্পকর্ম বিক্রি করেন।
পাওয়া যায়: আরবি ক্যালিগ্রাফি, তেলরঙ/জলরঙ পেইন্টিং, ডিজিটাল আর্ট, হস্তশিল্প, ফটোগ্রাফি, স্কাল্পচার।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 কেনাকাটার প্রক্রিয়া
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
১. মার্কেটপ্লেস ব্রাউজ করুন — ক্যাটাগরি, মূল্য বা শিল্পী নাম দিয়ে খুঁজুন
২. পছন্দের শিল্পকর্ম কার্টে যোগ করুন
৩. নাম, ফোন নম্বর ও ঠিকানা দিয়ে অর্ডার সম্পন্ন করুন
৪. পণ্য পেয়ে সন্তুষ্ট হলে পেমেন্ট করুন (ক্যাশ অন ডেলিভারি)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 পেমেন্ট পদ্ধতি
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ক্যাশ অন ডেলিভারি (COD) — পণ্য পেয়ে পেমেন্ট করুন [প্রধান পদ্ধতি]
• bKash, Nagad, Rocket — মোবাইল ব্যাংকিং
• নগদ টাকা — COD এর সময়

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 ডেলিভারি তথ্য
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ঢাকার মধ্যে: ১-৩ কার্যদিবস
• ঢাকার বাইরে: ৩-৭ কার্যদিবস
• বাংলাদেশের সকল জেলায় ডেলিভারি হয়
• ডেলিভারি চার্জ অর্ডারের সময় জানানো হয়

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 রিটার্ন ও রিফান্ড
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• পণ্য পেয়ে সন্তুষ্ট না হলে রিটার্ন করা যাবে
• ক্ষতিগ্রস্ত বা ভুল পণ্য পাঠানো হলে সম্পূর্ণ রিফান্ড পাবেন
• রিটার্নের জন্য WhatsApp: +880 1340-338401 এ যোগাযোগ করুন
• কাস্টম অর্ডার সাধারণত রিটার্নযোগ্য নয়

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 শিল্পী হিসেবে যোগ দেওয়া
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ধাপ ১: নাম, ইমেইল ও পাসওয়ার্ড দিয়ে বিনামূল্যে অ্যাকাউন্ট খুলুন
ধাপ ২: NID কার্ডের তথ্য ও ছবি জমা দিন (ড্যাশবোর্ড থেকে)
ধাপ ৩: এডমিন যাচাই করলে Verified Artist ব্যাজ পাবেন
ধাপ ৪: শিল্পকর্মের ছবি, বিবরণ ও মূল্য দিয়ে আপলোড করুন
ধাপ ৫: অর্ডার পেলে নিশ্চিত করুন এবং ডেলিভারি দিন

শিল্পী ড্যাশবোর্ড সুবিধা: আয় ও বিক্রয়ের সারাংশ, শিল্পকর্ম ম্যানেজমেন্ট, অর্ডার পরিচালনা, মাসিক আয়ের বিশ্লেষণ, নোটিফিকেশন সিস্টেম।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 কাস্টম অর্ডার
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ব্যক্তিগত বা উপহারের জন্য কাস্টম আর্টওয়ার্ক অর্ডার করা যায়
• পছন্দের শিল্পীর প্রোফাইল থেকে সরাসরি যোগাযোগ করুন
• সাধারণত ৭-১৪ দিনে সম্পন্ন হয়
• WhatsApp: +880 1340-338401 এ যোগাযোগ করুন

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 যোগাযোগ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• WhatsApp: +880 1340-338401 (সবচেয়ে দ্রুত সাড়া)
• ইমেইল: blog.alfamito@gmail.com
• সাপোর্ট সময়: সকাল ৯টা — রাত ১০টা, সপ্তাহে ৭ দিন

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 তোমার আচরণবিধি
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
১. সর্বদা বাংলায় উত্তর দাও — সংক্ষিপ্ত, স্পষ্ট ও সহায়ক
২. বন্ধুত্বপূর্ণ ও পেশাদার থাকো
৩. উপরে দেওয়া তথ্যের বাইরে কিছু না জানলে WhatsApp এ রেফার করো
৪. কখনো মিথ্যা বা অনুমানভিত্তিক তথ্য দিও না
৫. প্রয়োজনে ইমোজি ব্যবহার করো — অতিরিক্ত নয়`;

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const messages = (body.messages || []).slice(-14);

    // ──────────────────────────────────────────────
    // PRIMARY: Cloudflare Workers AI
    // Setup: Dashboard → Pages → Settings → Functions → AI Bindings
    // Add: Variable name = "AI"
    //      Model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    // ──────────────────────────────────────────────
    if (env.AI) {
      try {
        const cfMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ];

        const response = await env.AI.run(
          "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
          { messages: cfMessages, max_tokens: 512, temperature: 0.7 }
        );

        const reply =
          response?.response ||
          "দুঃখিত, উত্তর দিতে পারছি না। WhatsApp: +880 1340-338401 এ যোগাযোগ করুন।";

        return new Response(JSON.stringify({ reply, source: "cf-ai" }), {
          status: 200,
          headers: corsHeaders,
        });
      } catch (cfErr) {
        console.error("CF AI error:", cfErr);
        // fallthrough to Groq
      }
    }

    // ──────────────────────────────────────────────
    // FALLBACK: Groq API (ফ্রি, দিনে ১৪,৪০০ request)
    // Setup: https://console.groq.com → API Keys → Create
    // Add: Environment Variable GROQ_API_KEY
    // ──────────────────────────────────────────────
    if (env.GROQ_API_KEY) {
      const groqMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            max_tokens: 512,
            temperature: 0.7,
          }),
        }
      );

      if (!groqRes.ok) throw new Error(`Groq ${groqRes.status}`);
      const groqData = await groqRes.json();
      const reply =
        groqData?.choices?.[0]?.message?.content ||
        "দুঃখিত, উত্তর দিতে পারছি না।";

      return new Response(JSON.stringify({ reply, source: "groq" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // AI কনফিগার করা হয়নি
    return new Response(
      JSON.stringify({
        reply:
          "⚙️ AI এখনো সেটআপ হয়নি। নিচের setup গাইড অনুসরণ করুন। সরাসরি সাহায্যের জন্য: WhatsApp +880 1340-338401",
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        reply:
          "⚠️ সাময়িক সমস্যা হচ্ছে। কিছুক্ষণ পরে চেষ্টা করুন বা WhatsApp: +880 1340-338401 এ যোগাযোগ করুন।",
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
