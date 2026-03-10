import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Palette, 
  Phone, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  CheckCircle,
  FileText,
  Upload,
  X,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, uploadToCloudinary } from '../lib/supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    district: '',
    bio: '',
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'nidFront' | 'nidBack') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ফাইলের সাইজ ৫ মেগাবাইটের কম হতে হবে');
        return;
      }
      const preview = URL.createObjectURL(file);
      if (type === 'profile') {
        setProfileFile(file);
        setProfilePreview(preview);
      } else if (type === 'nidFront') {
        setNidFrontFile(file);
        setNidFrontPreview(preview);
      } else if (type === 'nidBack') {
        setNidBackFile(file);
        setNidBackPreview(preview);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error('ইমেইল এবং পাসওয়ার্ড প্রদান করুন');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
        return;
      }
    } else if (step === 2) {
      if (!formData.fullName || !formData.phone || !formData.district) {
        toast.error('সবগুলো তথ্য পূরণ করুন');
        return;
      }
    } else if (step === 3) {
      if (!nidFrontFile || !nidBackFile) {
        toast.error('এনআইডি কার্ডের দুই পাশের ছবি আপলোড করুন');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success('স্বাগতম! আপনি সফলভাবে লগইন করেছেন।');
        navigate('/dashboard');
      } else {
        // Signup - Only at the final step
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (authError) throw authError;

        if (authData.user) {
          let profileImageUrl = null;
          let nidFrontUrl = null;
          let nidBackUrl = null;
          
          // Upload files
          const uploadPromises = [];
          if (profileFile) uploadPromises.push(uploadToCloudinary(profileFile, 'shilposhop_profiles').then(res => profileImageUrl = res.url));
          if (nidFrontFile) uploadPromises.push(uploadToCloudinary(nidFrontFile, 'shilposhop_nids').then(res => nidFrontUrl = res.url));
          if (nidBackFile) uploadPromises.push(uploadToCloudinary(nidBackFile, 'shilposhop_nids').then(res => nidBackUrl = res.url));
          
          await Promise.all(uploadPromises);

          // Create artist profile
          const { error: profileError } = await supabase
            .from('artists')
            .insert({
              user_id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              district: formData.district,
              bio: formData.bio,
              profile_image_url: profileImageUrl,
              nid_front_url: nidFrontUrl,
              nid_back_url: nidBackUrl,
              is_verified: false,
              is_active: true,
              art_types: [],
              rating_avg: 0,
              rating_count: 0,
              total_sales: 0
            });
          
          if (profileError) throw profileError;
          
          setShowSuccess(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.message === 'Invalid login credentials') {
        message = 'ভুল ইমেইল বা পাসওয়ার্ড। দয়া করে সঠিক তথ্য দিন।';
      } else if (error.message?.includes('email rate limit exceeded') || error.message?.includes('Email limit exceeded')) {
        message = 'দুঃখিত, বর্তমানে আমাদের সার্ভারে রেজিস্ট্রেশন লিমিট শেষ হয়ে গেছে। দয়া করে কিছুক্ষণ পর অথবা আগামীকাল আবার চেষ্টা করুন।';
      } else if (error.message === 'User already registered') {
        message = 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে।';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'আপনার ইমেইল এখনো যাচাই করা হয়নি। দয়া করে ইনবক্স চেক করুন।';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4">অভিনন্দন!</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">
            আপনার শিল্পী অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে। আমরা আপনার এনআইডি কার্ড যাচাই করার পর আপনাকে কনফার্মেশন জানাব। এখন আপনি লগইন করতে পারেন।
          </p>
          <button 
            onClick={() => { setIsLogin(true); setShowSuccess(false); setStep(1); }}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            লগইন করুন
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-stone-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 overflow-hidden"
      >
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-[1.5rem] sm:rounded-[2rem] mb-6">
              <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-stone-900">
              {isLogin ? 'শিল্পী লগইন' : 'শিল্পী হিসেবে যোগ দিন'}
            </h2>
            <p className="text-stone-500 mt-3 text-sm sm:text-lg">
              {isLogin ? 'আপনার সৃজনশীল স্টুডিওতে ফিরে আসার জন্য স্বাগতম' : 'বিশ্বের কাছে আপনার শিল্পকর্ম তুলে ধরা শুরু করুন'}
            </p>
          </div>

          {/* Progress Bar for Signup */}
          {!isLogin && (
            <div className="flex items-center justify-between mb-10 max-w-sm mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base transition-all ${step >= s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-stone-100 text-stone-400'}`}>
                    {step > s ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`h-1 flex-1 mx-1 sm:mx-2 rounded-full transition-all ${step > s ? 'bg-emerald-600' : 'bg-stone-100'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div 
                  key="login-fields"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="email"
                      placeholder="ইমেইল অ্যাড্রেস"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="password"
                      placeholder="পাসওয়ার্ড"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </motion.div>
              ) : (
                <>
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" /> ধাপ ১: অ্যাকাউন্ট তথ্য
                      </h3>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="email"
                          placeholder="ইমেইল অ্যাড্রেস"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="password"
                          placeholder="পাসওয়ার্ড"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" /> ধাপ ২: ব্যক্তিগত তথ্য
                      </h3>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="text"
                          placeholder="পুরো নাম"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="tel"
                          placeholder="ফোন নম্বর"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="text"
                          placeholder="জেলা"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> ধাপ ৩: এনআইডি ভেরিফিকেশন
                      </h3>
                      <p className="text-sm text-stone-500 mb-4">নিরাপত্তার স্বার্থে আপনার এনআইডি কার্ডের দুই পাশের ছবি আপলোড করুন।</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">সামনের দিক</p>
                          <div className="relative aspect-video rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden group hover:border-emerald-500 transition-colors">
                            {nidFrontPreview ? (
                              <img src={nidFrontPreview} alt="NID Front" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs">ছবি আপলোড</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileSelect(e, 'nidFront')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">পিছনের দিক</p>
                          <div className="relative aspect-video rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden group hover:border-emerald-500 transition-colors">
                            {nidBackPreview ? (
                              <img src={nidBackPreview} alt="NID Back" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs">ছবি আপলোড</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileSelect(e, 'nidBack')}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" /> ধাপ ৪: প্রোফাইল ব্র্যান্ডিং
                      </h3>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-stone-100 border-4 border-white shadow-xl relative">
                            {profilePreview ? (
                              <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <User className="w-10 h-10 sm:w-12 sm:h-12" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileSelect(e, 'profile')}
                            />
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 font-medium">প্রোফাইল ছবি আপলোড করুন</p>
                      </div>

                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
                        <textarea
                          placeholder="আপনার সম্পর্কে কিছু লিখুন (Bio)"
                          rows={4}
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none resize-none text-sm sm:text-base"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-4">
              {!isLogin && step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 sm:py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ChevronLeft className="w-5 h-5" />
                  পিছনে
                </button>
              )}
              
              {!isLogin && step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] py-3 sm:py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  পরবর্তী ধাপ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 sm:py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'প্রসেসিং হচ্ছে...' : (isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন')}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
              }}
              className="text-stone-500 hover:text-emerald-600 transition-colors text-xs sm:text-sm font-bold"
            >
              {isLogin ? "অ্যাকাউন্ট নেই? আজই যোগ দিন" : "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
