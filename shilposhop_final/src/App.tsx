import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, LayoutDashboard, LogOut, Menu, X,
  Palette, ShieldCheck, Heart, Search, Bell
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
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchArtistProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchArtistProfile(session.user.id);
      else setArtistProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchArtistProfile = async (userId: string) => {
    const { data } = await supabase.from('artists').select('*').eq('user_id', userId).single();
    setArtistProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const isAdmin = session?.user?.email === (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com');

  // Transparent on hero, solid on scroll or non-home pages
  const navBg = (!isHome || scrolled)
    ? 'bg-[#1a1208]/98 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-[#b5944a]/20'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)' }}>
              <Palette className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-display font-bold text-white tracking-tight">শিল্পশপ</span>
              <span className="text-[9px] text-[#b5944a] font-medium uppercase tracking-widest">Art Marketplace</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/marketplace', label: 'মার্কেটপ্লেস' },
              { to: '/artists', label: 'শিল্পীগণ' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === to || location.pathname.startsWith(to + '/')
                    ? 'bg-[#b5944a]/20 text-[#d4b06a]'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/wishlist" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-colors">
              <Heart className="w-5 h-5 text-stone-300" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-colors">
              <ShoppingBag className="w-5 h-5 text-stone-300" />
              {totalItems > 0 && (
                <motion.span key={totalItems} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: '#b5944a' }}>
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {session ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-xl hover:bg-white/10">
                    <ShieldCheck className="w-4 h-4" />এডমিন
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors rounded-xl hover:bg-white/10">
                  <LayoutDashboard className="w-4 h-4" />ড্যাশবোর্ড
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-stone-400 hover:text-red-400 text-sm font-medium transition-colors rounded-xl hover:bg-red-500/10">
                  <LogOut className="w-4 h-4" />লগআউট
                </button>
              </>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)' }}>
                <User className="w-4 h-4" />শিল্পী লগইন
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-stone-300" />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: '#b5944a' }}>{totalItems}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-stone-300 hover:bg-white/10 rounded-xl">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10"
            style={{ background: '#1a1208' }}>
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/marketplace', label: 'মার্কেটপ্লেস' },
                { to: '/artists', label: 'শিল্পীগণ' },
                { to: '/wishlist', label: `উইশলিস্ট${wishCount > 0 ? ` (${wishCount})` : ''}` },
                { to: '/cart', label: `কার্ট${totalItems > 0 ? ` (${totalItems})` : ''}` },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-stone-300 font-semibold rounded-2xl hover:bg-white/10 hover:text-white transition-all">
                  {label}
                </Link>
              ))}
              {session ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-stone-300 font-semibold rounded-2xl hover:bg-white/10">এডমিন</Link>}
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-stone-300 font-semibold rounded-2xl hover:bg-white/10">ড্যাশবোর্ড</Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-red-400 font-semibold rounded-2xl hover:bg-red-500/10">লগআউট</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 mt-3 px-4 py-4 text-white rounded-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)' }}>
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
    <footer style={{ background: '#0f0b05' }} className="text-stone-500 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b5944a, #d4b06a)' }}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-display font-bold text-white block leading-none">শিল্পশপ</span>
                <span className="text-[9px] text-[#b5944a] uppercase tracking-widest">Art Marketplace</span>
              </div>
            </div>
            <p className="max-w-sm mb-8 leading-relaxed text-sm text-stone-400">
              বাংলাদেশের স্বাধীন শিল্পীদের সাথে শিল্পপ্রেমীদের সংযোগ। অনন্য, হাতে তৈরি শিল্পকর্ম অন্বেষণ করুন।
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', label: 'Facebook' },
                { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', label: 'Instagram' },
              ].map(({ icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-stone-500 hover:text-white border border-stone-800 hover:border-[#b5944a]/50"
                  style={{ background: 'rgba(181,148,74,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(181,148,74,0.15)') }
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(181,148,74,0.05)') }>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={icon}/></svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-widest" style={{ color: '#b5944a' }}>মার্কেটপ্লেস</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/marketplace', label: 'সবগুলো শিল্পকর্ম' },
                { to: '/marketplace?category=Painting', label: 'পেইন্টিং' },
                { to: '/marketplace?category=Arabic Calligraphy', label: 'আরবি ক্যালিগ্রাফি' },
                { to: '/marketplace?category=Handicraft', label: 'হাতে তৈরি শিল্প' },
                { to: '/marketplace?category=Digital Art', label: 'ডিজিটাল আর্ট' },
              ].map(({ to, label }) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors hover:pl-1 block">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold mb-6 uppercase tracking-widest" style={{ color: '#b5944a' }}>শিল্পীদের জন্য</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/login', label: 'শিল্পী হিসেবে যোগ দিন' },
                { to: '/dashboard', label: 'শিল্পী ড্যাশবোর্ড' },
                { to: '/artists', label: 'সব শিল্পী দেখুন' },
              ].map(({ to, label }) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors hover:pl-1 block">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} শিল্পশপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
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
            style: {
              fontFamily: 'Hind Siliguri, sans-serif',
              borderRadius: '16px',
              background: '#1a1208',
              color: '#fff',
              border: '1px solid rgba(181,148,74,0.3)',
            },
            success: { iconTheme: { primary: '#b5944a', secondary: '#fff' } },
          }} />
          <div className="min-h-screen text-stone-900 font-sans" style={{ background: '#faf8f4' }}>
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
