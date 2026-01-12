// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // PASTIKAN PROPERTI CONTENT INI BENAR
  content: [
    "./index.html",
    // BARIS INI HARUS MENCAPAI SEMUA FILE KOMPONEN DI PROYEK DEPAN (frontend)
    // Jika Navbar.jsx ada di folder 'frontend/src'
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}