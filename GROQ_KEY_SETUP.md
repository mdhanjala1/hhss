# 🔑 AI চ্যাট ঠিক করার নির্দেশনা
## সমস্যা: "সংযোগ সমস্যা" দেখাচ্ছিল — কারণ GROQ_API_KEY ছিল না

---

## ✅ মাত্র ৩টি কাজ করুন

---

### কাজ ১ — Groq API Key নিন (৩ মিনিট, বিনামূল্যে)

1. **https://console.groq.com** → Google দিয়ে Sign Up করুন
2. বাম মেনুতে **"API Keys"** ক্লিক করুন
3. **"Create API Key"** বাটনে ক্লিক করুন
4. Key টি কপি করুন — `gsk_` দিয়ে শুরু হবে

---

### কাজ ২ — .env ফাইলে যোগ করুন

আপনার project এর `.env` ফাইল খুলুন এবং এই লাইনটি যোগ করুন:

```
VITE_GROQ_API_KEY=gsk_আপনার_key_এখানে
```

---

### কাজ ৩ — Cloudflare Dashboard এ যোগ করুন ⭐ সবচেয়ে গুরুত্বপূর্ণ

1. **https://dash.cloudflare.com** → লগইন করুন
2. **Workers & Pages** → আপনার project (shilposhop বা যেটা আছে)
3. উপরে **"Settings"** ট্যাব
4. **"Environment variables"** → **"Add variable"**
5. এভাবে যোগ করুন:

| Field | Value |
|-------|-------|
| Variable name | `VITE_GROQ_API_KEY` |
| Value | `gsk_আপনার_key` |

6. **"Encrypt"** চেক করুন (optional কিন্তু ভালো)
7. **"Save"** করুন
8. তারপর **"Deployments"** → **"Retry deployment"** ক্লিক করুন

---

## ✅ কাজ হয়েছে কিনা বুঝবেন কিভাবে?

আপনার সাইটে যান → নিচে-ডানে **"সাহায্য দরকার?"** বাটন → ক্লিক করুন → যেকোনো প্রশ্ন করুন → AI বাংলায় উত্তর দেবে!

---

## ❓ এখনো কাজ না করলে?

**"🔑 API key টি সঠিক নয়"** দেখালে → Groq থেকে নতুন key নিন

**"📡 ইন্টারনেট সংযোগ চেক করুন"** দেখালে → Cloudflare এ key সেট আছে কিনা দেখুন এবং redeploy করুন

**অন্য সমস্যায়** → WhatsApp: +880 1340-338401

---

## 💰 খরচ: সম্পূর্ণ বিনামূল্যে

- Groq ফ্রি tier: দিনে **১৪,৪০০ request**, মিনিটে **৩০ request**
- Cloudflare Pages: সম্পূর্ণ ফ্রি
