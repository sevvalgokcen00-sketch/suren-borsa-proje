"use client";

import Link from "next/link";

export default function NasilCalisirPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden font-sans text-white">

      {/* ARKA PLAN */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.65] scale-105 transition duration-1000"
        style={{
          backgroundImage: `url('/arkaplan.png')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-10 px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4 animate-fade-down">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-lg tracking-wider">
            ♻️
          </div>

          <div>
            <span className="font-black text-lg tracking-wider block leading-none text-white">
              DÖNGÜ<span className="ml-0.5 text-white">BORSA</span>
            </span>

            <span className="text-[9px] uppercase tracking-widest text-slate-300 font-semibold">
              B2B Demir-Çelik Borsası
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide text-slate-200">
          <Link href="/" className="hover:text-white transition">
            GİRİŞ EKRANI
          </Link>

          <Link href="/anasayfa" className="hover:text-white transition">
            BORSA PİYASASI
          </Link>

          <Link href="/ilanlar-paneli" className="hover:text-white transition">
            İLANLAR
          </Link>

          <Link
            href="/nasil-calisir"
            style={{ color: "#729CD4" }}
            className="font-extrabold underline"
          >
            NASIL ÇALIŞIR?
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-xs font-bold">
          <Link
            href="/anasayfa"
            style={{ backgroundColor: "#123873" }}
            className="hover:opacity-90 text-white px-6 py-2.5 rounded-full transition shadow-lg border border-white/20 cursor-pointer"
          >
            Borsaya Git →
          </Link>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10 flex-1 w-full my-auto">

        {/* BAŞLIK */}
        <div className="text-center space-y-4 max-w-3xl mx-auto animate-fade-up">

          <span className="bg-[#123873]/60 border border-white/20 text-slate-200 text-[11px] font-bold px-4 py-1.5 rounded-full inline-block backdrop-blur-md animate-soft-pulse">
            🌱 Doğa + Endüstri Birleşimi
          </span>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-lg text-white">
            Endüstriyel Atıkları Dijital Borsada <br />
            <span style={{ color: "#729CD4" }}>
              Nasıl Değere Dönüştürüyoruz?
            </span>
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed drop-shadow">
            DöngüBorsa; fabrikaların işlenmemiş ham üretim artığı metal ve
            ikincil hammaddelarını şeffaf medyan fiyatlar, teklif yönetimi ve
            Kapsam 3 emisyon takibiyle güvenle ticarete açar.
          </p>
        </div>

        {/* 4 ADIM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          {/* 01 */}
          <div className="step-card bg-black/25 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl space-y-4 hover:border-[#729CD4] hover:-translate-y-1 transition-all duration-500">

            <div className="w-12 h-12 rounded-xl bg-[#123873]/80 text-white flex items-center justify-center font-black text-lg border border-white/20 backdrop-blur-md">
              01
            </div>

            <h3 className="font-bold text-white text-base">
              İlan & Stok Girişi
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed">
              Üretim tesisleri elindeki henüz işlenmemiş DKP kırpıntı, sac
              kesim fireleri veya talaş stoklarını cins, miktar ve lokasyon
              bilgileriyle sisteme güvenli şekilde yükler.
            </p>
          </div>

          {/* 02 */}
          <div className="step-card bg-black/25 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl space-y-4 hover:border-[#729CD4] hover:-translate-y-1 transition-all duration-500">

            <div className="w-12 h-12 rounded-xl bg-[#123873]/80 text-white flex items-center justify-center font-black text-lg border border-white/20 backdrop-blur-md">
              02
            </div>

            <h3 className="font-bold text-white text-base">
              Canlı Medyan Endeks
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed">
              Fiyatlar serbest piyasa manipülasyonundan uzak, tamamlanmış
              borsa işlemlerinin medyanı alınarak şeffaf bir şekilde anlık
              olarak belirlenir.
            </p>
          </div>

          {/* 03 */}
          <div className="step-card bg-black/25 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl space-y-4 hover:border-[#729CD4] hover:-translate-y-1 transition-all duration-500">

            <div className="w-12 h-12 rounded-xl bg-[#123873]/80 text-white flex items-center justify-center font-black text-lg border border-white/20 backdrop-blur-md">
              03
            </div>

            <h3 className="font-bold text-white text-base">
              Teklifler ve Yönetim
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed">
              Alıcı ve satıcılar Teklifler Sayfası üzerinden verilmiş
              teklifleri takip eder, fiyat revizyonları yapar ve en avantajlı
              koşullarda anlaşma sağlar.
            </p>
          </div>

          {/* 04 */}
          <div className="step-card bg-black/25 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl space-y-4 hover:border-[#729CD4] hover:-translate-y-1 transition-all duration-500">

            <div className="w-12 h-12 rounded-xl bg-[#123873]/80 text-white flex items-center justify-center font-black text-lg border border-white/20 backdrop-blur-md">
              04
            </div>

            <h3 className="font-bold text-white text-base">
              Yeşil Dönüşüm & Rapor
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed">
              İşlem tamamlandığında ISO 14064 uyumlu karbon azaltım raporu
              otomatik oluşturulur, firmaların ESG skoruna doğrudan katkı
              sağlanır.
            </p>
          </div>

        </div>

        {/* BUTON */}
        <div className="flex items-center justify-center pt-2 animate-fade-up-delayed">

          <Link
            href="/anasayfa"
            className="bg-black/30 hover:bg-black/50 backdrop-blur-md text-white font-bold px-10 py-4 rounded-2xl text-xs transition-all duration-500 shadow-2xl border border-white/30 tracking-wider hover:border-[#729CD4] hover:-translate-y-1 cursor-pointer"
          >
            Piyasayı Keşfet →
          </Link>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 border-t border-white/10 gap-4 bg-black/30 backdrop-blur-md">

        <p>© 2026 DöngüBorsa • Tüm Hakları Saklıdır.</p>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          <span>Kapsam 3 Emisyon Takibi</span>
          <span className="hidden sm:inline">•</span>
          <span>Akıllı Müzakere Terminali</span>
          <span className="hidden sm:inline">•</span>
          <span>3.1 MTR Sertifikalı</span>
        </div>

      </footer>

      {/* ANİMASYONLAR */}
      <style jsx>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.9;
          }
        }

        .animate-fade-down {
          animation: fadeDown 0.8s ease-out both;
        }

        .animate-fade-up {
          animation: fadeUp 0.9s ease-out 0.15s both;
        }

        .animate-fade-up-delayed {
          animation: fadeUp 0.9s ease-out 0.7s both;
        }

        .animate-soft-pulse {
          animation: softPulse 3s ease-in-out infinite;
        }

        .step-card {
          opacity: 0;
          animation: fadeUp 0.7s ease-out forwards;
        }

        .step-card:nth-child(1) {
          animation-delay: 0.3s;
        }

        .step-card:nth-child(2) {
          animation-delay: 0.45s;
        }

        .step-card:nth-child(3) {
          animation-delay: 0.6s;
        }

        .step-card:nth-child(4) {
          animation-delay: 0.75s;
        }
      `}</style>

    </div>
  );
}