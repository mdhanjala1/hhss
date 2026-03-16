import React from 'react';
const W = '#c2a06e';
const ITEMS = [
  { title: '১. তথ্য সংগ্রহ', body: 'আমরা আপনার নাম, ইমেইল, ফোন নম্বর ও ঠিকানা সংগ্রহ করি। শিল্পীদের ক্ষেত্রে NID তথ্যও সংগ্রহ করা হয় পরিচয় যাচাইয়ের জন্য।' },
  { title: '২. তথ্য ব্যবহার', body: 'সংগৃহীত তথ্য অর্ডার প্রক্রিয়াকরণ, অ্যাকাউন্ট যাচাই ও কাস্টমার সাপোর্টের জন্য ব্যবহৃত হয়। আমরা কখনও তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি করি না।' },
  { title: '৩. তথ্য সুরক্ষা', body: 'আপনার তথ্য Supabase-এ সুরক্ষিতভাবে সংরক্ষিত। শিল্পকর্মের ছবি Cloudinary-তে সংরক্ষিত। আমরা শিল্পমানের এনক্রিপশন ব্যবহার করি।' },
  { title: '৪. কুকি', body: 'আমরা সেশন ম্যানেজমেন্টের জন্য কুকি ব্যবহার করি। ব্রাউজার সেটিংস থেকে কুকি বন্ধ করা যাবে, তবে কিছু ফিচার কাজ নাও করতে পারে।' },
  { title: '৫. আপনার অধিকার', body: 'আপনি যেকোনো সময় আপনার তথ্য দেখতে, পরিবর্তন করতে বা মুছতে পারবেন। অ্যাকাউন্ট ডিলিট করতে আমাদের সাথে যোগাযোগ করুন।' },
];
export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border shadow-sm p-10" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(194,160,110,0.12)', color: W }}>গোপনীয়তা</span>
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>গোপনীয়তা নীতি</h1>
          {ITEMS.map((s, i) => (
            <div key={i} className="mb-7">
              <h2 className="text-lg font-bold mb-2" style={{ color: W }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{s.body}</p>
            </div>
          ))}
          <p className="text-xs mt-8 pt-6 border-t" style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>সর্বশেষ আপডেট: মার্চ ২০২৬</p>
        </div>
      </div>
    </div>
  );
}
