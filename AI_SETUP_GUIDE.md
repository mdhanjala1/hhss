# 🤖 শিল্পশপ AI কাস্টমার কেয়ার — Setup Guide
## Cloudflare Workers AI (Llama 3.3 70B) — সম্পূর্ণ বিনামূল্যে

---

## ✅ নতুন যা যোগ হয়েছে

| ফাইল | কাজ |
|------|-----|
| `src/components/ChatWidget.tsx` | সম্পূর্ণ নতুন AI চ্যাট UI |
| `functions/api/chat.js` | Cloudflare Pages Function |
| `src/App.tsx` | ChatWidget import করা |

---

## 🔥 কেন Cloudflare Workers AI?

| বিষয় | Gemini | Cloudflare Workers AI |
|------|--------|----------------------|
| মডেল | Gemini Flash (ছোট) | Llama 3.3 70B (বড়, শক্তিশালী) |
| ফ্রি limit | ১,৫০০/দিন | ১০,০০০ neurons/দিন (অনেক বেশি) |
| Speed | মাঝামাঝি | অত্যন্ত দ্রুত |
| API Key | লাগে | লাগে না! |
| সেটআপ | আলাদা | Cloudflare এর ভেতরেই |

---

## 🚀 STEP 1: Cloudflare AI Binding চালু করুন

1. **Cloudflare Dashboard** → https://dash.cloudflare.com এ লগইন করুন
2. বাম মেনু থেকে **"Workers & Pages"** → আপনার Pages project এ ক্লিক করুন
3. উপরে **"Settings"** ট্যাবে যান
4. বাম দিকে **"Functions"** অপশনে ক্লিক করুন
5. নিচে স্ক্রল করুন — **"AI Bindings"** সেকশন খুঁজুন
6. **"Add Binding"** বাটনে ক্লিক করুন:
   - **Variable name:** `AI`
   - (Model স্বয়ংক্রিয়ভাবে নির্বাচিত হবে)
7. **"Save"** করুন

> ✅ ব্যস! কোনো API key লাগবে না।

---

## 🚀 STEP 2: Code Deploy করুন

ZIP থেকে এই ফাইলগুলো আপনার GitHub repo-তে push করুন:

```
src/components/ChatWidget.tsx    ← সম্পূর্ণ নতুন
src/App.tsx                       ← আপডেট (ChatWidget যোগ)
functions/api/chat.js             ← সম্পূর্ণ নতুন
```

Cloudflare Pages GitHub থেকে auto-deploy করবে।

---

## 🔄 STEP 3: Groq Fallback (ঐচ্ছিক কিন্তু recommended)

Cloudflare AI কোনো কারণে কাজ না করলে Groq backup হিসেবে কাজ করবে।

1. **https://console.groq.com** → Sign Up (বিনামূল্যে)
2. **"API Keys"** → **"Create API Key"** → Key কপি করুন
3. Cloudflare Dashboard → Pages → Settings → **Environment Variables**
4. **"Add variable"**:
   - Name: `GROQ_API_KEY`
   - Value: আপনার Groq key
5. Production ও Preview উভয়তে → **Save**

> Groq ফ্রি tier: দিনে **১৪,৪০০ request**, মিনিটে **৩০ request**

---

## ✅ পরীক্ষা করুন

Deploy হওয়ার পর আপনার সাইটে যান:
- নিচে-ডানে **"সাহায্য দরকার?"** বাটন দেখবেন
- ক্লিক করলে চ্যাট উইন্ডো খুলবে
- ৮টি দ্রুত প্রশ্নের বাটন থাকবে
- যেকোনো প্রশ্নে AI বাংলায় উত্তর দেবে!

---

## 🎯 চ্যাট ফিচার তালিকা

| ফিচার | বিবরণ |
|-------|--------|
| 🤖 Llama 3.3 70B | GPT-4 এর সমমানের মডেল |
| 🇧🇩 বাংলা সাপোর্ট | সম্পূর্ণ বাংলায় কথোপকথন |
| ⚡ দ্রুত প্রশ্ন | ৮টি common question বাটন |
| 💬 Context মেমোরি | কথোপকথনের ইতিহাস মনে রাখে |
| 📱 Responsive | মোবাইল ও ডেস্কটপ উভয়তে |
| 🌙 Dark/Light mode | সাইটের থিম অনুসরণ করে |
| ⚠️ WhatsApp fallback | সমস্যায় WhatsApp-এ redirect |
| 🔄 Reset বাটন | নতুন কথোপকথন শুরু |
| 🔴 Unread badge | নতুন মেসেজের notification |

---

## 💰 মোট খরচ: ৳০

| সেবা | ফ্রি লিমিট |
|------|-----------|
| Cloudflare Workers AI | ১০,০০০ neurons/দিন |
| Cloudflare Pages Functions | ১,০০,০০০ req/দিন |
| Groq (fallback) | ১৪,৪০০ req/দিন |
| **মোট** | **সম্পূর্ণ বিনামূল্যে** |

---

## 🔧 সমস্যা সমাধান

**"⚙️ AI কনফিগার করা হয়নি" দেখাচ্ছে?**
→ STEP 1 সঠিকভাবে করুন। AI Binding-এর Variable name ঠিক `AI` হতে হবে।

**চ্যাট দেখাচ্ছে না?**
→ `src/App.tsx` এ `import ChatWidget` এবং `<ChatWidget />` আছে কিনা দেখুন।

**Groq কাজ করছে না?**
→ `GROQ_API_KEY` environment variable সঠিকভাবে সেট আছে কিনা দেখুন।
