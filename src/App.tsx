import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LayoutDashboard, LogOut, Menu, X, Palette, ShieldCheck, Heart, MessageCircle, BookOpen } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ArtworkDetail from './pages/ArtworkDetail';
import ArtistProfile from './pages/ArtistProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Artists from './pages/Artists';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const WHATSAPP_NUMBER = '8801340338401';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const isAdmin = session?.user?.email?.trim().toLowerCase() ===
    (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com').trim().toLowerCase();

  // On home page: transparent until scrolled. On other pages: always solid.
  const solid = !isHome || scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      solid ? 'bg-stone-900 shadow-lg shadow-stone-900/20 border-b border-white/5' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white block leading-none tracking-tight">শিল্পশপ</span>
              <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-semibold">Art Marketplace</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/marketplace', label: 'মার্কেটপ্লেস' },
              { to: '/artists', label: 'শিল্পীগণ' },
              { to: '/how-it-works', label: 'কীভাবে ব্যবহার করবেন' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === to
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-stone-300 hover:text-white hover:bg-white/8'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/wishlist" className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
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
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/8 transition-all text-sm font-semibold">
                  <LayoutDashboard className="w-4 h-4" />ড্যাশবোর্ড
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold">
                  <LogOut className="w-4 h-4" />লগআউট
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 ml-2">
                <User className="w-4 h-4" />লগইন
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative p-2 text-white">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>}
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
            className="md:hidden bg-stone-900 border-t border-white/10 overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/marketplace', label: 'মার্কেটপ্লেস' },
                { to: '/artists', label: 'শিল্পীগণ' },
                { to: '/how-it-works', label: 'কীভাবে ব্যবহার করবেন' },
                { to: '/wishlist', label: `উইশলিস্ট${wishCount > 0 ? ` (${wishCount})` : ''}` },
                { to: '/contact', label: 'যোগাযোগ' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8 hover:text-white transition-all">
                  {label}
                </Link>
              ))}
              {session ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8">এডমিন</Link>}
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-300 font-semibold rounded-xl hover:bg-white/8">ড্যাশবোর্ড</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 font-semibold rounded-xl hover:bg-red-500/10">লগআউট</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 mt-2 px-4 py-4 bg-emerald-600 text-white rounded-2xl font-bold">
                  <User className="w-5 h-5" />শিল্পী হিসেবে যোগ দিন
                </Link>
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
    <footer className="bg-stone-900 text-stone-400 pt-16 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg block leading-none">শিল্পশপ</span>
                <span className="text-emerald-500 text-[9px] uppercase tracking-widest">Art Marketplace</span>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mb-6">বাংলাদেশের স্বাধীন শিল্পীদের সাথে শিল্পপ্রেমীদের সংযোগ ঘটানোর সেরা প্ল্যাটফর্ম।</p>
            {/* Payment icons */}
            <div>
              <p className="text-xs text-stone-600 mb-3 font-semibold uppercase tracking-wider">আমরা সমর্থন করি</p>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { label: 'bKash', bg: '#E2136E', color: 'white' },
                  { label: 'Nagad', bg: '#F4821F', color: 'white' },
                  { label: 'Rocket', bg: '#8B1A8B', color: 'white' },
                  { label: 'COD', bg: '#1c1917', color: '#10b981' },
                ].map(p => (
                  <span key={p.label} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10"
                    style={{ background: p.bg, color: p.color }}>
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-5">মার্কেটপ্লেস</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['/marketplace', 'সব শিল্পকর্ম'],
                ['/marketplace?category=Painting', 'পেইন্টিং'],
                ['/marketplace?category=Arabic Calligraphy', 'ক্যালিগ্রাফি'],
                ['/marketplace?category=Handicraft', 'হস্তশিল্প'],
                ['/artists', 'শিল্পীগণ'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors hover:translate-x-1 block">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-5">সহায়তা</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['/how-it-works', 'কীভাবে ব্যবহার করবেন'],
                ['/contact', 'যোগাযোগ করুন'],
                ['/login', 'শিল্পী হিসেবে যোগ দিন'],
                ['/dashboard', 'শিল্পী ড্যাশবোর্ড'],
                ['/terms', 'শর্তাবলী'],
                ['/privacy', 'গোপনীয়তা নীতি'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors block">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 pb-6 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} শিল্পশপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-5">
            {[['/terms','শর্তাবলী'],['/privacy','গোপনীয়তা'],['/contact','যোগাযোগ']].map(([to, l]) => (
              <Link key={to} to={to} className="hover:text-stone-300 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// WhatsApp floating button
function WhatsAppButton() {
  return (
    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=শিল্পশপ থেকে সাহায্য দরকার`}
      target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-green-500/30 group"
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
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'Hind Siliguri, sans-serif', borderRadius: '14px', background: '#1c1917', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          }} />
          <div className="min-h-screen bg-white text-stone-900">
            <Navbar />
            <main className="pt-16 min-h-[calc(100vh-64px)]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/artwork/:id" element={<ArtworkDetail />} />
                <Route path="/artist/:id" element={<ArtistProfile />} />
                <Route path="/dashboard" element={<ArtistDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
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
          </div>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
