# 🤖 শিল্পশপ AI কাস্টমার কেয়ার — সেটআপ গাইড

## ✅ যা যা যোগ হয়েছে:
- `src/components/ChatWidget.tsx` — সম্পূর্ণ AI চ্যাট UI
- `functions/api/chat.js` — Cloudflare Pages Function (Gemini সংযোগ)
- `src/App.tsx` — ChatWidget import ও ব্যবহার

---

## 🚀 ধাপ ১: Google Gemini API Key নিন (ফ্রি)

1. **https://aistudio.google.com** এ যান
2. Google অ্যাকাউন্ট দিয়ে লগইন করুন
3. **"Get API Key"** বাটনে ক্লিক করুন
4. **"Create API Key"** → key কপি করুন

> ✨ বিনামূল্যে: দিনে **১,৫০০ requests** ও মিনিটে **১৫ requests** পাবেন। ছোট-মাঝারি ব্যবসার জন্য যথেষ্ট!

---

## 🚀 ধাপ ২: Cloudflare Pages এ Environment Variable সেট করুন

1. **Cloudflare Dashboard** → আপনার Pages প্রজেক্টে যান
2. **Settings → Environment Variables** এ ক্লিক করুন
3. **"Add variable"** ক্লিক করুন:
   - **Variable name:** `GEMINI_API_KEY`
   - **Value:** আপনার Gemini API key (ধাপ ১ থেকে)
4. **Production** ও **Preview** উভয়তে যোগ করুন
5. **Save** করুন

---

## 🚀 ধাপ ৩: কোড Deploy করুন

এই ফাইলগুলো আপনার GitHub repo-তে push করুন:

```
src/components/ChatWidget.tsx   ← নতুন ফাইল
src/App.tsx                      ← আপডেট হয়েছে
functions/api/chat.js            ← নতুন ফাইল
```

Cloudflare Pages স্বয়ংক্রিয়ভাবে build ও deploy করবে।

---

## ✅ পরীক্ষা করুন

Deploy হওয়ার পর আপনার সাইটে যান:
- নিচে-ডানে **"সাহায্য দরকার?"** বাটন দেখবেন
- ক্লিক করলে চ্যাট উইন্ডো খুলবে
- প্রশ্ন করুন — AI বাংলায় উত্তর দেবে!

---

## 🎯 ফিচার তালিকা

| ফিচার | বিবরণ |
|-------|--------|
| 🤖 AI চ্যাট | Google Gemini 2.0 Flash দিয়ে চালিত |
| 🇧🇩 বাংলা ভাষা | সম্পূর্ণ বাংলায় কথোপকথন |
| ⚡ দ্রুত প্রশ্ন | ৬টি common question বাটন |
| 💬 Context মেমোরি | কথোপকথনের ইতিহাস মনে রাখে |
| 📱 Mobile friendly | সব ডিভাইসে কাজ করে |
| 🌙 Dark mode | সাইটের dark/light mode অনুসরণ করে |
| ⚠️ Fallback | সমস্যায় WhatsApp-এ redirect করে |
| 🔄 Reset | নতুন কথোপকথন শুরু করার সুবিধা |

---

## 💡 AI কী কী বিষয়ে উত্তর দিতে পারে:

- ডেলিভারি সময় ও চার্জ
- পেমেন্ট পদ্ধতি (bKash, Nagad, COD ইত্যাদি)
- রিটার্ন ও রিফান্ড পলিসি
- শিল্পী নিবন্ধন প্রক্রিয়া
- কাস্টম অর্ডার তথ্য
- অর্ডার ট্র্যাকিং নির্দেশনা
- সাধারণ কাস্টমার সাপোর্ট

---

## 🔧 সমস্যা সমাধান

**চ্যাট কাজ করছে না?**
- Cloudflare Dashboard এ `GEMINI_API_KEY` সঠিকভাবে সেট আছে কিনা দেখুন
- Browser console এ error আছে কিনা চেক করুন
- `functions/api/chat.js` ফাইলটি repo-তে আছে কিনা নিশ্চিত করুন

**AI ভুল তথ্য দিচ্ছে?**
- `functions/api/chat.js` এর `SYSTEM_PROMPT` আপডেট করুন
- আপনার ব্যবসার সঠিক তথ্য যোগ করুন

---

## 💰 খরচ: সম্পূর্ণ বিনামূল্যে!

| সেবা | ফ্রি লিমিট |
|------|-----------|
| Google Gemini 2.0 Flash | ১,৫০০ req/দিন, ১৫ req/মিনিট |
| Cloudflare Pages Functions | ১,০০,০০০ req/দিন |
| **মোট খরচ** | **৳০** |
