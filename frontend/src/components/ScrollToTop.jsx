// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll ke atas setiap kali 'pathname' (jalur URL) berubah
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Komponen ini tidak merender apa-apa
}