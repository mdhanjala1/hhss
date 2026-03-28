import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LayoutDashboard, LogOut, Menu, X, Palette, ShieldCheck, Heart, Moon, Sun, UserPlus, Eye } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { DarkModeProvider, useDark } from './context/DarkModeContext';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ArtworkDetail from './pages/ArtworkDetail';
import ArtistProfile from './pages/ArtistProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Artists from './pages/Artists';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ChatWidget from './components/ChatWidget';

const WA = '8801340338401';

// ── SVG Payment icons ──────────────────────────────────────────
const BkashIcon = () => (
  <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
    <rect width="60" height="24" rx="4" fill="#E2136E"/>
    <text x="30" y="16.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">bKash</text>
  </svg>
);
const NagadIcon = () => (
  <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
    <rect width="60" height="24" rx="4" fill="#F4821F"/>
    <text x="30" y="16.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">Nagad</text>
  </svg>
);
const RocketIcon = () => (
  <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
    <rect width="60" height="24" rx="4" fill="#8B1A8B"/>
    <text x="30" y="16.5" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">Rocket</text>
  </svg>
);
const VisaIcon = () => (
  <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
    <rect width="60" height="24" rx="4" fill="#1a1f71"/>
    <text x="30" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" fontStyle="italic">VISA</text>
  </svg>
);
const MastercardIcon = () => (
  <svg viewBox="0 0 44 28" className="h-5 w-auto" fill="none">
    <rect width="44" height="28" rx="4" fill="#252525"/>
    <circle cx="16" cy="14" r="9" fill="#EB001B"/>
    <circle cx="28" cy="14" r="9" fill="#F79E1B"/>
    <path d="M22 7.8a9 9 0 0 1 0 12.4A9 9 0 0 1 22 7.8z" fill="#FF5F00"/>
  </svg>
);
const CodIcon = () => (
  <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
    <rect width="60" height="24" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <text x="30" y="16.5" textAnchor="middle" fill="#c2a06e" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">COD</text>
  </svg>
);

function DarkToggle() {
  const { dark, toggle } = useDark();
  return (
    <button onClick={toggle} title={dark ? 'লাইট মোড' : 'ডার্ক মোড'}
      className="p-2.5 rounded-xl transition-all hover:scale-105"
      style={{ background: dark ? 'rgba(212,168,85,0.15)' : 'rgba(255,255,255,0.08)', color: dark ? '#d4a855' : '#c8b090' }}>
      {dark ? <Sun className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} /> : <Moon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />}
    </button>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Session বদলালে moderator status চেক করো
  useEffect(() => {
    const email = session?.user?.email || '';
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com').trim().toLowerCase();
    if (!email || email.trim().toLowerCase() === adminEmail) { setIsModerator(false); return; }
    // DB থেকে check
    supabase.from('moderators').select('email').eq('email', email.trim().toLowerCase()).eq('is_active', true).maybeSingle()
      .then(({ data }) => setIsModerator(!!data))
      .catch(() => setIsModerator(false));
  }, [session]);

  const logout = async () => { await supabase.auth.signOut(); navigate('/'); setIsOpen(false); };
  const isAdmin = session?.user?.email?.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com').trim().toLowerCase();

  const navBg = scrolled
    ? 'bg-[rgba(26,14,5,0.97)] shadow-lg shadow-black/30'
    : 'bg-[rgba(26,14,5,0.85)]';

  const active = (to: string) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b border-white/5 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#c2a06e,#8b6914)' }}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-white block leading-none tracking-tight">শিল্পশপ</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#c2a06e' }}>Art Marketplace</span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {[
              { to: '/marketplace', l: 'মার্কেটপ্লেস' },
              { to: '/artists', l: 'শিল্পীগণ' },
              { to: '/how-it-works', l: 'কীভাবে ব্যবহার' },
            ].map(({ to, l }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active(to) ? 'text-[#c2a06e]' : 'text-stone-300 hover:text-white hover:bg-white/8'}`}
                style={active(to) ? { background: 'rgba(194,160,110,0.15)' } : {}}>
                {l}
              </Link>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-1">
            <DarkToggle />

            <Link to="/wishlist" className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: '#c2a06e' }}>
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {session ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />এডমিন
                  </Link>
                )}
                {isModerator && (
                  <Link to="/moderator"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-sm font-bold border"
                    style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)' }}>
                    <Eye className="w-4 h-4" />নিয়ন্ত্রণ প্যানেল
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all text-sm font-semibold">
                  <LayoutDashboard className="w-4 h-4" />ড্যাশবোর্ড
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold">
                  <LogOut className="w-4 h-4" />লগআউট
                </button>
              </>
            ) : (
              <>
                {/* "শিল্পী যুক্ত হন" highlighted button */}
                <Link to="/login"
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-1"
                  style={{ background: 'rgba(194,160,110,0.12)', color: '#d4c090', border: '1px solid rgba(194,160,110,0.25)' }}>
                  <UserPlus className="w-4 h-4" />শিল্পী যুক্ত হন
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-5 py-2 text-white rounded-xl font-bold text-sm transition-all shadow-lg ml-1"
                  style={{ background: 'linear-gradient(135deg,#c2a06e,#8b6914)', boxShadow: '0 4px 15px rgba(194,160,110,0.4)' }}>
                  <User className="w-4 h-4" />লগইন
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-1.5">
            <DarkToggle />
            {!session && (
              <Link to="/login" className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl font-bold text-xs"
                style={{ background: 'linear-gradient(135deg,#c2a06e,#8b6914)' }}>
                <UserPlus className="w-3.5 h-3.5" />যুক্ত হন
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-white">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: '#c2a06e' }}>{totalItems}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/8" style={{ background: '#1a0e05' }}>
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/marketplace', l: 'মার্কেটপ্লেস' }, { to: '/artists', l: 'শিল্পীগণ' },
                { to: '/how-it-works', l: 'কীভাবে ব্যবহার করবেন' },
                { to: '/wishlist', l: `উইশলিস্ট${wishCount > 0 ? ` (${wishCount})` : ''}` },
                { to: '/contact', l: 'যোগাযোগ' },
              ].map(({ to, l }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8 hover:text-white transition-all">{l}</Link>
              ))}

              {session ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8">এডমিন</Link>}
                  {isModerator && (
                    <Link to="/moderator" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 font-bold rounded-xl border"
                      style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)' }}>
                      <Eye className="w-4 h-4" />নিয়ন্ত্রণ প্যানেল
                    </Link>
                  )}
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8">ড্যাশবোর্ড</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-red-400 font-semibold rounded-xl hover:bg-red-500/10">লগআউট</button>
                </>
              ) : (
                <div className="space-y-2 mt-2">
                  {/* Login button */}
                  <Link to="/login" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 text-white rounded-2xl font-bold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#c2a06e,#8b6914)' }}>
                    <User className="w-5 h-5" /> লগইন করুন
                  </Link>
                  {/* Register button — highlighted */}
                  <Link to="/login" onClick={() => { setIsOpen(false); }} state={{ register: true }}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all border"
                    style={{ background: 'rgba(194,160,110,0.12)', color: '#d4b87a', borderColor: 'rgba(194,160,110,0.35)' }}>
                    <UserPlus className="w-5 h-5" /> 🎨 অ্যাকাউন্ট তৈরি করুন (বিনামূল্যে)
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="pt-14 pb-0 text-stone-400" style={{ background: '#1a0e05' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c2a06e,#8b6914)' }}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg block leading-none">শিল্পশপ</span>
                <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#c2a06e' }}>Art Marketplace</span>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mb-6">বাংলাদেশের স্বাধীন শিল্পীদের সাথে শিল্পপ্রেমীদের সংযোগ ঘটানোর সেরা প্ল্যাটফর্ম।</p>

            {/* Payment methods - SVG icons */}
            <div>
              <p className="text-xs text-stone-600 mb-3 font-semibold uppercase tracking-wider">পেমেন্ট পদ্ধতি</p>
              <div className="flex items-center gap-3 flex-wrap">
                <BkashIcon /><NagadIcon /><RocketIcon /><VisaIcon /><MastercardIcon /><CodIcon />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#c2a06e' }}>মার্কেটপ্লেস</h4>
            <ul className="space-y-3 text-sm">
              {[['/marketplace','সব শিল্পকর্ম'],['/marketplace?category=Painting','পেইন্টিং'],['/marketplace?category=Arabic Calligraphy','ক্যালিগ্রাফি'],['/marketplace?category=Handicraft','হস্তশিল্প'],['/artists','শিল্পীগণ']].map(([to,l])=>(
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#c2a06e' }}>সহায়তা</h4>
            <ul className="space-y-3 text-sm">
              {[['/how-it-works','কীভাবে ব্যবহার করবেন'],['/contact','যোগাযোগ'],['/login','শিল্পী হিসেবে যোগ দিন'],['/terms','শর্তাবলী'],['/privacy','গোপনীয়তা নীতি']].map(([to,l])=>(
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-5 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} শিল্পশপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-5">
            {[['/terms','শর্তাবলী'],['/privacy','গোপনীয়তা'],['/contact','যোগাযোগ']].map(([to,l])=>(
              <Link key={to} to={to} className="hover:text-stone-300 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a href={`https://wa.me/${WA}?text=শিল্পশপ থেকে সাহায্য দরকার`}
      target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-105"
      style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
      <svg className="w-6 h-6 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="text-sm">সাপোর্ট</span>
    </a>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
              style: { fontFamily: 'Hind Siliguri, sans-serif', borderRadius: '14px', background: '#1a0e05', color: '#f2e4cc', border: '1px solid rgba(194,160,110,0.2)' },
              success: { iconTheme: { primary: '#c2a06e', secondary: '#fff' } },
            }} />
            <div className="min-h-screen">
              <Navbar />
              <main className="pt-16 min-h-[calc(100vh-64px)]">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/artwork/:id" element={<ArtworkDetail />} />
                  <Route path="/artist/:id" element={<ArtistProfile />} />
                  <Route path="/dashboard" element={<ArtistDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/moderator" element={<ModeratorDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
              <ChatWidget />
            </div>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </DarkModeProvider>
  );
}
