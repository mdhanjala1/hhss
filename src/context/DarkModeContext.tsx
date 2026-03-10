import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('shilpo-dark') === '1'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', dark ? '1' : '0');
    try { localStorage.setItem('shilpo-dark', dark ? '1' : '0'); } catch {}
  }, [dark]);

  const toggle = () => setDark(d => !d);
  return <DarkModeContext.Provider value={{ dark, toggle }}>{children}</DarkModeContext.Provider>;
}

export const useDark = () => useContext(DarkModeContext);
