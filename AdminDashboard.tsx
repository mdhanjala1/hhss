import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, LayoutDashboard, LogOut, Menu, X,
  Palette, ShieldCheck, Heart, Search
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
  };

  const isAdmin = session?.user?.email === (import.meta.env.VITE_ADMIN_EMAIL || 'blog.alfamito@gmail.com');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100' : 'bg-white/80 backdrop-blur-md border-b border-stone-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight text-stone-900">ShilpoShop</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link to="/marketplace" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/marketplace' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}>
                মার্কেটপ্লেস
              </Link>
              <Link to="/artists" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname.startsWith('/artist') ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}>
                শিল্পীগণ
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 hover:bg-stone-100 rounded-xl transition-colors">
              <Heart className="w-5 h-5 text-stone-600" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 hover:bg-stone-100 rounded-xl transition-colors">
              <ShoppingBag className="w-5 h-5 text-stone-600" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {session ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors rounded-xl hover:bg-stone-50">
                    <ShieldCheck className="w-4 h-4" />এডমিন
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors rounded-xl hover:bg-stone-50">
                  <LayoutDashboard className="w-4 h-4" />ড্যাশবোর্ড
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-red-600 text-sm font-medium transition-colors rounded-xl hover:bg-red-50">
                  <LogOut className="w-4 h-4" />লগআউট
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm font-bold">
                <User className="w-4 h-4" />
                শিল্পী লগইন
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative p-2 hover:bg-stone-100 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-stone-600" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link to="/marketplace" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>মার্কেটপ্লেস</Link>
              <Link to="/artists" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>শিল্পীগণ</Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>
                উইশলিস্ট {wishCount > 0 && <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{wishCount}টি</span>}
              </Link>
              <Link to="/cart" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>
                কার্ট {totalItems > 0 && <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}টি</span>}
              </Link>
              {session ? (
                <>
                  {isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>এডমিন</Link>}
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50" onClick={() => setIsOpen(false)}>ড্যাশবোর্ড</Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-500 font-semibold rounded-2xl hover:bg-red-50">লগআউট</button>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center gap-2 mt-3 px-4 py-4 bg-emerald-600 text-white rounded-2xl font-bold" onClick={() => setIsOpen(false)}>
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
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold text-white">ShilpoShop</span>
            </div>
            <p className="max-w-sm mb-8 leading-relaxed text-sm">
              স্বাধীন শিল্পীদের সাথে শিল্পপ্রেমীদের সংযোগ। অনন্য, হাতে তৈরি শিল্পকর্ম অন্বেষণ করুন।
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-stone-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors text-stone-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors text-stone-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">মার্কেটপ্লেস</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">সবগুলো শিল্পকর্ম</Link></li>
              <li><Link to="/marketplace?category=Painting" className="hover:text-emerald-400 transition-colors">পেইন্টিং</Link></li>
              <li><Link to="/marketplace?category=Arabic Calligraphy" className="hover:text-emerald-400 transition-colors">আরবি ক্যালিগ্রাফি</Link></li>
              <li><Link to="/marketplace?category=Handicraft" className="hover:text-emerald-400 transition-colors">হাতে তৈরি শিল্প</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">শিল্পীদের জন্য</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">শিল্পী হিসেবে যোগ দিন</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">শিল্পী ড্যাশবোর্ড</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">বিক্রয় নির্দেশিকা</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} শিল্পশপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">শর্তাবলী</a>
            <a href="#" className="hover:text-white transition-colors">গোপনীয়তা</a>
            <a href="#" className="hover:text-white transition-colors">যোগাযোগ</a>
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
            style: { fontFamily: 'Hind Siliguri, sans-serif', borderRadius: '16px' }
          }} />
          <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-emerald-100">
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
