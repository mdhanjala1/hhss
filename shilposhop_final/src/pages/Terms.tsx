import React from 'react';
export default function Terms() {
  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-10">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">আইনি</span>
          <h1 className="text-3xl font-bold text-stone-900 mb-8">শর্তাবলী</h1>
          {[
            { title: '১. সেবার বিবরণ', body: 'শিল্পশপ একটি অনলাইন আর্ট মার্কেটপ্লেস যেখানে শিল্পীরা তাদের শিল্পকর্ম বিক্রি করতে পারেন এবং ক্রেতারা সেগুলো কিনতে পারেন। আমরা একটি মধ্যস্থতাকারী প্ল্যাটফর্ম হিসেবে কাজ করি।' },
            { title: '২. অ্যাকাউন্ট তৈরি', body: 'শিল্পী হিসেবে যোগ দিতে হলে সঠিক তথ্য দিয়ে অ্যাকাউন্ট তৈরি করতে হবে এবং NID যাচাই করতে হবে। মিথ্যা তথ্য দিলে অ্যাকাউন্ট বাতিল করা হবে।' },
            { title: '৩. শিল্পকর্মের মালিকানা', body: 'শিল্পী তার আপলোড করা শিল্পকর্মের সম্পূর্ণ মালিক। শিল্পশপ কেবল বিক্রয়ের সুবিধা প্রদান করে। কপিরাইট লঙ্ঘনের দায় সম্পূর্ণ শিল্পীর।' },
            { title: '৪. পেমেন্ট ও লেনদেন', body: 'আমরা ক্যাশ অন ডেলিভারি পদ্ধতিতে পেমেন্ট গ্রহণ করি। পণ্য বুঝে পাওয়ার পরে পেমেন্ট দিতে হবে। ভুল বা ক্ষতিগ্রস্ত পণ্যের ক্ষেত্রে ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
            { title: '৫. নিষিদ্ধ কার্যক্রম', body: 'অপ্রাসঙ্গিক, অশ্লীল বা আপত্তিকর কন্টেন্ট আপলোড নিষিদ্ধ। অন্যের শিল্পকর্ম নিজের বলে দাবি করা নিষিদ্ধ। প্ল্যাটফর্মের বাইরে সরাসরি লেনদেন নিরুৎসাহিত করা হয়।' },
            { title: '৬. পরিষেবা পরিবর্তন', body: 'শিল্পশপ যেকোনো সময় তার নীতি, ফিচার বা শর্তাবলী পরিবর্তন করার অধিকার রাখে। পরিবর্তনের বিষয়ে ব্যবহারকারীদের জানানো হবে।' },
          ].map((s, i) => (
            <div key={i} className="mb-7">
              <h2 className="text-lg font-bold text-stone-900 mb-2">{s.title}</h2>
              <p className="text-stone-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
          <p className="text-stone-400 text-xs mt-8 pt-6 border-t border-stone-100">সর্বশেষ আপডেট: মার্চ ২০২৬</p>
        </div>
      </div>
    </div>
  );
}
