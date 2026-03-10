import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  Palette, 
  Users, 
  CheckCircle,
  Clock,
  TrendingUp,
  Heart,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Globe,
  Sparkles,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Artwork } from '../types';

const FAQ_DATA = [
  {
    question: "শিল্পশপ থেকে কীভাবে কেনাকাটা করবেন?",
    answer: "পছন্দের শিল্পকর্মটি নির্বাচন করে 'অর্ডার করুন' বাটনে ক্লিক করুন। আপনার নাম, ঠিকানা এবং ফোন নম্বর দিয়ে ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করুন।"
  },
  {
    question: "ডেলিভারি চার্জ কত?",
    answer: "আমরা বর্তমানে সারা বাংলাদেশে ফ্রি ডেলিভারি দিচ্ছি। আপনার পছন্দের শিল্পকর্মটি কোনো অতিরিক্ত খরচ ছাড়াই আপনার হাতে পৌঁছে যাবে।"
  },
  {
    question: "আমি কি শিল্পী হিসেবে যোগ দিতে পারি?",
    answer: "হ্যাঁ! আপনি যদি একজন স্বাধীন শিল্পী হন, তবে 'শিল্পী হিসেবে যোগ দিন' বাটনে ক্লিক করে আপনার অ্যাকাউন্ট তৈরি করতে পারেন এবং আপনার শিল্পকর্ম বিক্রি শুরু করতে পারেন।"
  },
  {
    question: "পেমেন্ট পদ্ধতি কী?",
    answer: "আমরা বর্তমানে ক্যাশ অন ডেলিভারি (Cash on Delivery) পদ্ধতি সমর্থন করি। পণ্য হাতে পাওয়ার পর আপনি মূল্য পরিশোধ করবেন।"
  }
];

const FEATURES = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "নিরাপদ লেনদেন",
    desc: "প্রতিটি অর্ডার আমরা সরাসরি তদারকি করি এবং ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি।"
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "অকৃত্রিম শিল্পকর্ম",
    desc: "সরাসরি শিল্পীদের কাছ থেকে সংগৃহীত ১০০% অরিজিনাল এবং হাতে তৈরি শিল্প।"
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "সারা দেশে ডেলিভারি",
    desc: "খুবই যত্ন সহকারে আমরা আপনার পছন্দের শিল্পকর্মটি আপনার দোরগোড়ায় পৌঁছে দেই।"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "সহজ রিটার্ন",
    desc: "পণ্য পছন্দ না হলে বা কোনো ত্রুটি থাকলে সহজেই রিটার্ন করার সুবিধা।"
  }
];

export default function Home() {
  const [featuredArt, setFeaturedArt] = useState<Artwork[]>([]);
  const [calligraphyArt, setCalligraphyArt] = useState<Artwork[]>([]);
  const [paintingArt, setPaintingArt] = useState<Artwork[]>([]);
  const [handmadeArt, setHandmadeArt] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    
    // Featured
    const { data: featured } = await supabase
      .from('artworks')
      .select('*, artist:artists(*)')
      .eq('status', 'approved')
      .eq('is_featured', true)
      .limit(4);
    setFeaturedArt(featured || []);

    // Arabic Calligraphy
    const { data: calligraphy } = await supabase
      .from('artworks')
      .select('*, artist:artists(*)')
      .eq('status', 'approved')
      .eq('category', 'Arabic Calligraphy')
      .limit(4);
    setCalligraphyArt(calligraphy || []);

    // Painting
    const { data: painting } = await supabase
      .from('artworks')
      .select('*, artist:artists(*)')
      .eq('status', 'approved')
      .eq('category', 'Painting')
      .limit(4);
    setPaintingArt(painting || []);

    // Handmade Art (Handicrafts)
    const { data: handmade } = await supabase
      .from('artworks')
      .select('*, artist:artists(*)')
      .eq('status', 'approved')
      .eq('category', 'Handicraft')
      .limit(4);
    setHandmadeArt(handmade || []);

    setLoading(false);
  };

  const ArtworkGrid = ({ title, artworks }: { title: string, artworks: Artwork[] }) => (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">{title}</h2>
            <div className="h-1.5 w-24 bg-emerald-500 mt-4 rounded-full" />
          </div>
          <Link to="/marketplace" className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all group">
            সবগুলো দেখুন <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {artworks.map((art) => (
            <motion.div 
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/artwork/${art.id}`} className="block">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-100 artwork-card-shadow transition-all duration-500 group-hover:-translate-y-2">
                  <img 
                    src={art.image_url} 
                    alt={art.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="px-4 py-2 bg-white text-stone-900 rounded-full text-sm font-bold shadow-lg">
                      বিস্তারিত দেখুন
                    </span>
                  </div>
                  <div className="absolute top-6 right-6">
                    <button className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-stone-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-8 px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{art.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-emerald-600" />
                    </div>
                    <p className="text-stone-500 text-sm font-medium">শিল্পী: {art.artist?.full_name}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-emerald-600">৳{art.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-stone-600">৪.৯</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 to-white z-10" />
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] bg-emerald-50/30 rounded-full blur-[120px] rotate-12" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[80%] bg-stone-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-100/50 backdrop-blur text-emerald-700 rounded-full text-sm font-bold mb-10 border border-emerald-200/50">
                <Sparkles className="w-4 h-4" />
                <span>বাংলাদেশের ১ নম্বর আর্ট মার্কেটপ্লেস</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-stone-900 leading-[1.1] tracking-tight mb-8">
                সৃজনশীলতার <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">নতুন দিগন্ত</span> <br />
                উন্মোচন করুন।
              </h1>
              
              <p className="text-lg sm:text-xl text-stone-600 mb-12 leading-relaxed max-w-lg">
                দেশের সেরা শিল্পীদের হাতে তৈরি অনন্য শিল্পকর্ম এখন আপনার হাতের নাগালে। আপনার ঘরকে সাজান অকৃত্রিম সৌন্দর্যে।
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link 
                  to="/marketplace" 
                  className="px-12 py-5 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/20 flex items-center justify-center gap-3 group"
                >
                  মার্কেটপ্লেস দেখুন
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-12 py-5 bg-white text-stone-900 border-2 border-stone-100 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-stone-100"
                >
                  শিল্পী হিসেবে যোগ দিন
                </Link>
              </div>

              {/* Stats in Hero */}
              <div className="mt-16 flex items-center gap-12 border-t border-stone-100 pt-12">
                <div>
                  <p className="text-4xl font-bold text-stone-900">৫০০+</p>
                  <p className="text-stone-500 font-medium">স্বাধীন শিল্পী</p>
                </div>
                <div className="w-px h-12 bg-stone-100" />
                <div>
                  <p className="text-4xl font-bold text-stone-900">২.৫কে+</p>
                  <p className="text-stone-500 font-medium">বিক্রিত শিল্পকর্ম</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
                <img 
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1000" 
                  alt="Featured Art" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stone-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700" />
              
              <div className="absolute top-1/2 -right-12 translate-y-[-50%] bg-white p-6 rounded-3xl shadow-2xl border border-stone-50 z-20 max-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">সেরা শিল্পী</p>
                </div>
                <p className="text-sm font-bold text-stone-900">আমাদের সকল শিল্পী ভেরিফাইড এবং দক্ষ।</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-bold text-stone-900 mb-6">আমাদের বৈশিষ্ট্যসমূহ</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">কেন আপনি শিল্পশপ থেকে কেনাকাটা করবেন? আমাদের কিছু বিশেষ বৈশিষ্ট্য যা আমাদের আলাদা করে।</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-stone-200/50 border border-stone-50 hover:border-emerald-200 transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artworks Sections */}
      <ArtworkGrid title="নির্বাচিত শিল্পকর্ম" artworks={featuredArt} />
      <div className="bg-stone-50">
        <ArtworkGrid title="এরাবিক ক্যালিগ্রাফি" artworks={calligraphyArt} />
      </div>
      <ArtworkGrid title="পেইন্টিং" artworks={paintingArt} />
      <div className="bg-stone-50">
        <ArtworkGrid title="হাতে তৈরি শিল্প" artworks={handmadeArt} />
      </div>

      {/* Artist CTA Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-stone-900 rounded-[4rem] p-10 sm:p-24 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2000" 
                alt="Artist Background" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold mb-8 border border-emerald-500/30">
                  <Palette className="w-4 h-4" />
                  শিল্পীদের জন্য বিশেষ সুযোগ
                </div>
                <h2 className="text-4xl sm:text-7xl font-bold text-white leading-tight mb-8">
                  আপনি কি একজন <span className="text-emerald-500 italic">শিল্পী?</span> <br />
                  আমাদের সাথে যোগ দিন।
                </h2>
                <p className="text-stone-400 text-lg sm:text-xl mb-12 leading-relaxed">
                  হাজার হাজার শিল্প সংগ্রাহকের কাছে পৌঁছান, আপনার অর্ডারগুলো পেশাদারভাবে পরিচালনা করুন এবং শিল্পশপের মাধ্যমে আপনার সৃজনশীল ব্যবসা বৃদ্ধি করুন।
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-4 px-12 py-6 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/20 group"
                >
                  আজই বিক্রি শুরু করুন
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-3xl font-bold text-white mb-2">০%</h4>
                    <p className="text-stone-400">লিস্টিং ফি</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-3xl font-bold text-white mb-2">২৪/৭</h4>
                    <p className="text-stone-400">সাপোর্ট সিস্টেম</p>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-3xl font-bold text-white mb-2">১০০%</h4>
                    <p className="text-stone-400">নিরাপদ পেমেন্ট</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-3xl font-bold text-white mb-2">৫কে+</h4>
                    <p className="text-stone-400">সক্রিয় ক্রেতা</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-stone-900 mb-6">সাধারণ জিজ্ঞাসা</h2>
            <p className="text-stone-500 text-lg">আপনার মনে থাকা কিছু সাধারণ প্রশ্নের উত্তর</p>
          </div>
          
          <div className="space-y-6">
            {FAQ_DATA.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-stone-200/50 border border-stone-100"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-8 text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="text-xl font-bold text-stone-900">{faq.question}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openFaq === index ? 'bg-emerald-600 text-white rotate-180' : 'bg-stone-100 text-stone-400'}`}>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 text-stone-600 text-lg leading-relaxed border-t border-stone-50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
