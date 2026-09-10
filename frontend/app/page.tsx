"use client";

import Link from "next/link";

export default function HosgeldinizLandingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden font-sans text-white">
      
      {/* ARKA PLAN GÖRSELİ (public/doga.jpeg) VE KARARTMA */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.65] scale-105 transition duration-1000"
        style={{ 
          backgroundImage: `url('/doga.jpeg')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
      </div>

      {/* ÜST HEADER (NAVBAR) */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-lg tracking-wider">
            ♻️
          </div>
          <div>
            <span className="font-black text-lg tracking-wider block leading-none text-white">
              DÖNGÜ <span className="text-white">BORSA</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-300 font-semibold">B2B Demir-Çelik Borsası</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide text-slate-200">
          <Link href="/anasayfa" className="hover:text-white transition">BORSA PİYASASI</Link>
          <Link href="/ilanlar-paneli" className="hover:text-white transition">İLANLAR</Link>
          <Link href="/nasil-calisir" className="hover:text-white transition">NASIL ÇALIŞIR?</Link>
        </nav>

        <div className="flex items-center gap-3 text-xs font-bold">
          <Link 
            href="/anasayfa" 
            style={{ backgroundColor: "#1E314A" }}
            className="hover:opacity-90 text-white px-6 py-2.5 rounded-full transition shadow-lg border border-white/20"
          >
            BORSAYA GİRİŞ YAP →
          </Link>
        </div>
      </header>

      {/* ORTA HERO ALANI VE SLOGAN */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-8 my-auto py-16 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
            "Atığı Değere, <br />
            <span className="text-emerald-400">Kaynağı Döngüye</span> Dönüştürün."
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
            Endüstriyel metal artıklarını ve ikincil hammaddeleri dijital borsa tahtasında buluşturuyor; ISO 14064 standartlarıyla sanayide yeşil dönüşümü ve sıfır atık geleceğini inşa ediyoruz.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/anasayfa"
            style={{ backgroundColor: "#1E314A" }}
            className="hover:opacity-90 text-white font-bold px-8 py-4 rounded-2xl text-sm transition shadow-2xl flex items-center gap-2 border border-white/20 group"
          >
            <span>BORSAYA GİRİŞ YAP</span>
            <span className="group-hover:translate-x-1 transition">→</span>
          </Link>

          <Link
            href="/nasil-calisir"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl text-sm transition border border-white/20"
          >
            Sistem Nasıl Çalışır?
          </Link>
        </div>
      </main>

      {/* ALT FOOTER */}
      <footer className="relative z-10 px-8 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 border-t border-white/10 gap-4">
        <p>© 2026 DöngüBorsa • Tüm Hakları Saklıdır.</p>
        <div className="flex items-center gap-6">
          <span>Kapsam 3 Emisyon Takibi</span>
          <span>•</span>
          <span>Akıllı Müzakere Terminali</span>
          <span>•</span>
          <span>3.1 MTR Sertifikalı</span>
        </div>
      </footer>

    </div>
  );
}