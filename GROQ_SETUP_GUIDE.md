# 🤖 শিল্পশপ AI কাস্টমার কেয়ার — Groq Setup গাইড

## কেন Groq?
| | Gemini (আগে) | Groq (এখন) |
|---|---|---|
| মিনিটে request | ১৫ ⚠️ | **৩০** ✅ |
| দিনে request | ১,৫০০ | **১৪,৪০০** ✅ |
| Model | Gemini 2.0 Flash | **Llama 3.3 70B** ✅ |
| খরচ | ফ্রি | **ফ্রি** ✅ |

---

## ধাপ ১: Groq API Key নিন (৩ মিনিট)

1. **https://console.groq.com** এ যান
2. Google বা GitHub দিয়ে লগইন করুন
3. বাম মেনুতে **"API Keys"** ক্লিক করুন
4. **"Create API Key"** ক্লিক করুন
5. নাম দিন (যেমন: `shilposhop`) → **Submit**
6. Key কপি করুন — `gsk_` দিয়ে শুরু হবে ✅

---

## ধাপ ২: Cloudflare Pages-এ Key যোগ করুন

1. **Cloudflare Dashboard** → আপনার Pages প্রজেক্টে যান
2. **Settings** → **Environment Variables** ক্লিক করুন
3. **"Add variable"** ক্লিক করুন:
   - Variable name: `GROQ_API_KEY`
   - Value: আপনার key (ধাপ ১ থেকে)
4. **Production** ও **Preview** উভয়তে যোগ করুন
5. **Save** করুন

---

## ধাপ ৩: এই ফাইলগুলো GitHub-এ push করুন

```
functions/api/chat.js          ← নতুন (Groq backend)
src/components/ChatWidget.tsx  ← আপডেট (Llama 3.3 70B)
src/App.tsx                    ← আপডেট (ChatWidget চালু)
```

Cloudflare Pages স্বয়ংক্রিয়ভাবে deploy করবে।

---

## ✅ পরীক্ষা করুন

Deploy হওয়ার পর:
- নিচে-বামে **"সাহায্য দরকার?"** গোল্ডেন বাটন দেখবেন
- নিচে-ডানে **WhatsApp** সবুজ বাটন থাকবে
- AI বাটনে ক্লিক করুন → বাংলায় প্রশ্ন করুন!

---

## 🎯 ফিচার

- ✅ Llama 3.3 70B — চমৎকার বাংলা বোঝে
- ✅ ৮টি Quick Question বাটন
- ✅ কথোপকথনের ইতিহাস মনে রাখে
- ✅ Minimize করা যায়
- ✅ Error হলে WhatsApp লিংক দেখায়
- ✅ Mobile friendly
- ✅ Dark mode সাপোর্ট

---

## 💰 সম্পূর্ণ বিনামূল্যে!

| সেবা | ফ্রি Limit |
|------|-----------|
| Groq API | ১৪,৪০০ req/দিন · ৩০ req/মিনিট |
| Cloudflare Pages Functions | ১,০০,০০০ req/দিন |
| **মোট খরচ** | **৳০** |
