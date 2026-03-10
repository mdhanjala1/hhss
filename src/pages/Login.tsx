import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Palette, Eye, EyeOff, CheckCircle, ArrowRight, ArrowLeft, Camera, Upload, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, uploadToCloudinary } from '../lib/supabase';

const DISTRICTS = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ','কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টাঙ্গাইল','ব্রাহ্মণবাড়িয়া','ফেনী','নোয়াখালী','লক্ষ্মীপুর','চাঁদপুর','হবিগঞ্জ','মৌলভীবাজার','সুনামগঞ্জ','নেত্রকোনা','কিশোরগঞ্জ','ময়মনসিংহ','জামালপুর','শেরপুর','ফরিদপুর','মাদারীপুর','গোপালগঞ্জ','শরিয়তপুর','মুন্সিগঞ্জ','নরসিংদী','মানিকগঞ্জ','রাজবাড়ী','পাবনা','সিরাজগঞ্জ','নাটোর','নওগাঁ','বগুড়া','জয়পুরহাট','চাঁপাইনবাবগঞ্জ','দিনাজপুর','ঠাকুরগাঁও','পঞ্চগড়','নীলফামারী','লালমনিরহাট','কুড়িগ্রাম','গাইবান্ধা','খাগড়াছড়ি','রাঙ্গামাটি','বান্দরবান','কক্সবাজার','সাতক্ষীরা','যশোর','ঝিনাইদহ','মাগুরা','নড়াইল','মেহেরপুর','চুয়াডাঙ্গা','কুষ্টিয়া','ভোলা','পটুয়াখালী','পিরোজপুর','বরগুনা','ঝালকাঠি'];

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '', district: '', bio: ''
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Handle file selection with camera/gallery option
  const handleFileSelect = (accept: string, callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.capture = 'environment'; // enables camera on mobile
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) callback(file);
    };
    input.click();
  };

  const handleProfilePic = (file: File) => {
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = e => setProfilePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Step validation — NO signup yet, just move to next step
  const handleNext = () => {
    if (step === 1) {
      if (!form.email || !form.password) { toast.error('ইমেইল ও পাসওয়ার্ড দিন'); return; }
      if (form.password.length < 6) { toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('সঠিক ইমেইল ঠিকানা দিন'); return; }
    } else if (step === 2) {
      if (!form.fullName || !form.phone || !form.district) { toast.error('নাম, ফোন ও জেলা অবশ্যই দিন'); return; }
      if (form.phone.length < 11) { toast.error('সঠিক ফোন নম্বর দিন'); return; }
    }
    setStep(s => s + 1);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error('ইমেইল ও পাসওয়ার্ড দিন'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;
      toast.success('স্বাগতম! 🎉');
      navigate('/dashboard');
    } catch (e: any) {
      if (e.message === 'Invalid login credentials') toast.error('ভুল ইমেইল বা পাসওয়ার্ড');
      else toast.error(e.message || 'লগইন ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  // ONLY called from final "অ্যাকাউন্ট তৈরি করুন" button on step 3
  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      if (authError) {
        if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
          throw new Error('এই ইমেইলে আগেই অ্যাকাউন্ট আছে। লগইন করুন।');
        }
        throw authError;
      }
      if (!authData.user) throw new Error('অ্যাকাউন্ট তৈরি হয়নি। আবার চেষ্টা করুন।');

      // 2. Upload profile image if any
      let profileImageUrl: string | null = null;
      if (profileFile) {
        try {
          const res = await uploadToCloudinary(profileFile, 'shilposhop_profiles');
          profileImageUrl = res.url;
        } catch {
          // profile pic upload failure shouldn't block registration
        }
      }

      // 3. Create artist profile row
      const { error: profileError } = await supabase.from('artists').insert({
        user_id: authData.user.id,
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        district: form.district,
        bio: form.bio.trim() || null,
        profile_image_url: profileImageUrl,
        is_verified: false,
        is_active: true,
        verification_status: 'unverified',
        art_types: [],
        rating_avg: 0,
        rating_count: 0,
        total_sales: 0,
      });
      if (profileError) throw profileError;

      setShowSuccess(true);
    } catch (e: any) {
      let msg = 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      if (e.message?.includes('rate limit') || e.message?.includes('Email limit')) {
        msg = 'অনেক রেজিস্ট্রেশন হচ্ছে। কিছু পরে চেষ্টা করুন।';
      } else if (e.message) msg = e.message;
      toast.error(msg);
    } finally { setLoading(false); }
  };

  if (showSuccess) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-stone-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">অ্যাকাউন্ট তৈরি হয়েছে! 🎉</h2>
        <p className="text-stone-500 mb-2 text-sm leading-relaxed">আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>
        <p className="text-stone-500 mb-8 text-sm leading-relaxed">ড্যাশবোর্ড থেকে <strong>NID যাচাই</strong> করুন — এডমিন অনুমোদন করলে শিল্পকর্ম আপলোড করতে পারবেন।</p>
        <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
          ড্যাশবোর্ডে যান <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );

  const STEPS = ['লগইন তথ্য', 'ব্যক্তিগত তথ্য', 'প্রোফাইল ছবি'];

  return (
    <div className="min-h-screen bg-stone-50 flex pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-stone-900 flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">শিল্পশপে<br />স্বাগতম</h2>
          <p className="text-stone-400 text-lg leading-relaxed max-w-xs">বাংলাদেশের সেরা শিল্পীদের অনন্য শিল্পকর্মের মার্কেটপ্লেস</p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[['৫০০+','শিল্পী'], ['২৫০০+','শিল্পকর্ম'], ['০%','লিস্টিং ফি'], ['৬৪','জেলায় ডেলিভারি']].map(([n, l]) => (
              <div key={l} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{n}</p>
                <p className="text-stone-400 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Toggle */}
          <div className="flex bg-stone-100 rounded-2xl p-1 mb-8">
            {[true, false].map(val => (
              <button key={String(val)} onClick={() => { setIsLogin(val); setStep(1); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isLogin === val ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                {val ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন'}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {isLogin ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">আবার আসুন!</h2>
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">ইমেইল</label>
                <input type="email" placeholder="আপনার ইমেইল" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
              </div>
              <div className="relative">
                <label className="text-sm font-semibold text-stone-700 block mb-2">পাসওয়ার্ড</label>
                <input type={showPass ? 'text' : 'password'} placeholder="পাসওয়ার্ড" value={form.password} onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3.5 pr-12 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[42px] text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" />লগইন করুন</>}
              </button>
            </div>
          ) : (
            /* REGISTER */
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">নতুন অ্যাকাউন্ট</h2>
              <p className="text-stone-400 text-sm mb-6">ধাপ {step} / {STEPS.length}: {STEPS[step - 1]}</p>

              {/* Step progress */}
              <div className="flex items-center mb-8">
                {STEPS.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-emerald-600 text-white' : step === i + 1 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-stone-100 text-stone-400'}`}>
                        {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${step === i + 1 ? 'text-emerald-600' : 'text-stone-400'}`}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${step > i + 1 ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* STEP 1: Email & Password */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">ইমেইল *</label>
                    <input type="email" placeholder="আপনার ইমেইল ঠিকানা" value={form.email} onChange={e => set('email', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
                  </div>
                  <div className="relative">
                    <label className="text-sm font-semibold text-stone-700 block mb-2">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
                    <input type={showPass ? 'text' : 'password'} placeholder="একটি শক্তিশালী পাসওয়ার্ড দিন" value={form.password} onChange={e => set('password', e.target.value)}
                      className="w-full px-4 py-3.5 pr-12 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[42px] text-stone-400">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">পূর্ণ নাম *</label>
                    <input type="text" placeholder="আপনার পূর্ণ নাম" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">মোবাইল নম্বর *</label>
                    <input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">জেলা *</label>
                    <select value={form.district} onChange={e => set('district', e.target.value)}
                      className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                      <option value="">জেলা বেছে নিন</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-2">পরিচিতি (ঐচ্ছিক)</label>
                    <textarea placeholder="আপনার শিল্পসত্তা সম্পর্কে কিছু লিখুন..." value={form.bio} onChange={e => set('bio', e.target.value)}
                      rows={3} className="w-full px-4 py-3.5 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none bg-white" />
                  </div>
                </div>
              )}

              {/* STEP 3: Profile Picture — account created here */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-stone-500 text-sm">প্রোফাইল ছবি যোগ করুন (ঐচ্ছিক) — পরে ড্যাশবোর্ড থেকেও পরিবর্তন করতে পারবেন।</p>

                  {/* Profile pic picker */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                      {profilePreview
                        ? <img src={profilePreview} alt="preview" className="w-full h-full object-cover" />
                        : <User className="w-10 h-10 text-stone-300" />}
                    </div>
                    <div className="flex gap-3">
                      <button type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';
                          input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) handleProfilePic(f); };
                          input.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all">
                        <Camera className="w-4 h-4" /> ক্যামেরা
                      </button>
                      <button type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) handleProfilePic(f); };
                          input.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-50 transition-all">
                        <Upload className="w-4 h-4" /> গ্যালারি
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-700">
                    <strong>রেজিস্ট্রেশনের পর:</strong> ড্যাশবোর্ড থেকে NID কার্ড জমা দিন। এডমিন ভেরিফাই করলে আপনি শিল্পকর্ম আপলোড করতে পারবেন।
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-sm transition-all">
                    <ArrowLeft className="w-4 h-4" /> আগে
                  </button>
                )}
                {step < 3 ? (
                  <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all">
                    পরবর্তী <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleRegister} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold text-sm transition-all">
                    {loading
                      ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> অ্যাকাউন্ট তৈরি হচ্ছে...</>
                      : <><CheckCircle className="w-5 h-5" /> অ্যাকাউন্ট তৈরি করুন</>}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
