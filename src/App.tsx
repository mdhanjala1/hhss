import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, LayoutDashboard, LogOut, Menu, X,
  Palette, ShieldCheck, Heart
} from 'lucide-react';
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
    const onScroll = () => setScrolled(window.scrollY > 50);
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

  const transparent = isHome && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
      transparent ? '' : 'bg-white border-b border-stone-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-lg font-bold block leading-none ${transparent ? 'text-white' : 'text-stone-900'}`}>শিল্পশপ</span>
              <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-semibold">Art Marketplace</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {[{ to: '/marketplace', label: 'মার্কেটপ্লেস' }, { to: '/artists', label: 'শিল্পীগণ' }].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname.startsWith(to)
                    ? 'bg-emerald-50 text-emerald-700'
                    : transparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/wishlist" className={`relative p-2.5 rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-stone-500 hover:bg-stone-50'}`}>
              <Heart className="w-5 h-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
            </Link>

            <Link to="/cart" className={`relative p-2.5 rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-stone-500 hover:bg-stone-50'}`}>
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-1 ml-1">
                {isAdmin && (
                  <Link to="/admin" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-stone-600 hover:bg-stone-50'}`}>
                    <ShieldCheck className="w-4 h-4" />এডমিন
                  </Link>
                )}
                <Link to="/dashboard" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <LayoutDashboard className="w-4 h-4" />ড্যাশবোর্ড
                </Link>
                <button onClick={handleLogout} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${transparent ? 'text-red-300 hover:bg-white/10' : 'text-red-500 hover:bg-red-50'}`}>
                  <LogOut className="w-4 h-4" />লগআউট
                </button>
              </div>
            ) : (
              <Link to="/login" className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                <User className="w-4 h-4" />লগইন
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className={`relative p-2 rounded-xl ${transparent ? 'text-white' : 'text-stone-600'}`}>
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-xl ${transparent ? 'text-white' : 'text-stone-600'}`}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {[{ to: '/marketplace', label: 'মার্কেটপ্লেস' }, { to: '/artists', label: 'শিল্পীগণ' },
                { to: '/wishlist', label: `উইশলিস্ট${wishCount > 0 ? ` (${wishCount})` : ''}` },
                { to: '/cart', label: `কার্ট${totalItems > 0 ? ` (${totalItems})` : ''}` }].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors">
                  {label}
                </Link>
              ))}
              {session ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-700 font-semibold rounded-xl hover:bg-stone-50">এডমিন ড্যাশবোর্ড</Link>}
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-stone-700 font-semibold rounded-xl hover:bg-stone-50">শিল্পী ড্যাশবোর্ড</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50">লগআউট</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="mt-2 flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 text-white rounded-2xl font-bold">
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
    <footer className="bg-stone-900 text-stone-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
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
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mb-6">
              বাংলাদেশের স্বাধীন শিল্পীদের সাথে শিল্পপ্রেমীদের সংযোগ ঘটানোর সেরা প্ল্যাটফর্ম।
            </p>
          </div>
          <div>
            <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-5">মার্কেটপ্লেস</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['/marketplace', 'সব শিল্পকর্ম'],
                ['/marketplace?category=Painting', 'পেইন্টিং'],
                ['/marketplace?category=Arabic Calligraphy', 'ক্যালিগ্রাফি'],
                ['/marketplace?category=Handicraft', 'হস্তশিল্প'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-5">শিল্পীদের জন্য</h4>
            <ul className="space-y-3 text-sm">
              {[['/login', 'শিল্পী হিসেবে যোগ দিন'], ['/dashboard', 'শিল্পী ড্যাশবোর্ড'], ['/artists', 'সব শিল্পী']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} শিল্পশপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-5">
            {['শর্তাবলী', 'গোপনীয়তা', 'যোগাযোগ'].map(l => (
              <a key={l} href="#" className="hover:text-stone-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'Hind Siliguri, sans-serif', borderRadius: '14px', background: '#1c1917', color: '#fff' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          }} />
          <div className="min-h-screen bg-white text-stone-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
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
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
