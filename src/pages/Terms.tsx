import React from 'react';
const W = '#c2a06e';
const ITEMS = [
  { title: '১. সেবার বিবরণ', body: 'শিল্পশপ একটি অনলাইন আর্ট মার্কেটপ্লেস যেখানে শিল্পীরা তাদের শিল্পকর্ম বিক্রি করতে পারেন এবং ক্রেতারা সেগুলো কিনতে পারেন। আমরা একটি মধ্যস্থতাকারী প্ল্যাটফর্ম হিসেবে কাজ করি।' },
  { title: '২. অ্যাকাউন্ট তৈরি', body: 'শিল্পী হিসেবে যোগ দিতে হলে সঠিক তথ্য দিয়ে অ্যাকাউন্ট তৈরি করতে হবে এবং NID যাচাই করতে হবে। মিথ্যা তথ্য দিলে অ্যাকাউন্ট বাতিল করা হবে।' },
  { title: '৩. শিল্পকর্মের মালিকানা', body: 'শিল্পী তার আপলোড করা শিল্পকর্মের সম্পূর্ণ মালিক। শিল্পশপ কেবল বিক্রয়ের সুবিধা প্রদান করে। কপিরাইট লঙ্ঘনের দায় সম্পূর্ণ শিল্পীর।' },
  { title: '৪. পেমেন্ট ও লেনদেন', body: 'আমরা ক্যাশ অন ডেলিভারি পদ্ধতিতে পেমেন্ট গ্রহণ করি। পণ্য বুঝে পাওয়ার পরে পেমেন্ট দিতে হবে। পণ্য সতর্কতার সাথে প্যাক করে পাঠানো হয়।' },
  { title: '৫. নিষিদ্ধ কার্যক্রম', body: 'অপ্রাসঙ্গিক, অশ্লীল বা আপত্তিকর কন্টেন্ট আপলোড নিষিদ্ধ। অন্যের শিল্পকর্ম নিজের বলে দাবি করা নিষিদ্ধ।' },
  { title: '৬. পরিষেবা পরিবর্তন', body: 'শিল্পশপ যেকোনো সময় তার নীতি, ফিচার বা শর্তাবলী পরিবর্তন করার অধিকার রাখে। পরিবর্তনের বিষয়ে ব্যবহারকারীদের জানানো হবে।' },
];
export default function Terms() {
  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border shadow-sm p-10" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(194,160,110,0.12)', color: W }}>আইনি</span>
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>শর্তাবলী</h1>
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
