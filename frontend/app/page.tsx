"use client";

import Link from "next/link";

export default function HosgeldinizLandingPage() {
  return (
    <>
      <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden font-sans text-white">

        {/* =====================================================
            ARKA PLAN GÖRSELİ
        ====================================================== */}

        <div
          className="absolute inset-0 z-0 bg-cover bg-center home-background"
          style={{
            backgroundImage: `url('/doga.jpeg')`,
          }}
        >
          {/* KARARTMA */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 home-overlay"></div>

          {/* HAFİF IŞIK HAREKETİ */}
          <div className="absolute inset-0 home-light"></div>
        </div>


        {/* =====================================================
            ÜST HEADER / NAVBAR
        ====================================================== */}

        <header className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full home-header">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-lg tracking-wider logo-float">
              ♻️
            </div>

            <div>
              <span className="font-black text-lg tracking-wider block leading-none text-white">
                DÖNGÜ <span className="text-white">BORSA</span>
              </span>

              <span className="text-[9px] uppercase tracking-widest text-slate-300 font-semibold">
                B2B Demir-Çelik Borsası
              </span>
            </div>

          </div>


          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide text-slate-200">

            <Link
              href="/anasayfa"
              className="hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              BORSA PİYASASI
            </Link>

            <Link
              href="/ilanlar-paneli"
              className="hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              İLANLAR
            </Link>

            <Link
              href="/nasil-calisir"
              className="hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              NASIL ÇALIŞIR?
            </Link>

          </nav>


          {/* GİRİŞ BUTONU */}

          <div className="flex items-center gap-3 text-xs font-bold">

            <Link
              href="/anasayfa"
              style={{ backgroundColor: "#1E314A" }}
              className="hover:scale-105 hover:shadow-xl hover:shadow-black/30 text-white px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg border border-white/20"
            >
              BORSAYA GİRİŞ YAP →
            </Link>

          </div>

        </header>


        {/* =====================================================
            ORTA HERO ALANI
        ====================================================== */}

        <main className="relative z-10 max-w-4xl mx-auto w-full px-8 my-auto py-16 text-center space-y-8">

          <div className="space-y-4">

            {/* ANA BAŞLIK */}

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg hero-title">

              "Atığı Değere, <br />

              <span className="text-emerald-400 hero-green-text">
                Kaynağı Döngüye
              </span>{" "}

              Dönüştürün."

            </h1>


            {/* AÇIKLAMA */}

            <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow hero-description">

              Endüstriyel metal artıklarını ve ikincil hammaddeleri dijital
              borsa tahtasında buluşturuyor; ISO 14064 standartlarıyla sanayide
              yeşil dönüşümü ve sıfır atık geleceğini inşa ediyoruz.

            </p>

          </div>


          {/* =====================================================
              BUTONLAR
          ====================================================== */}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">

            {/* BORSAYA GİRİŞ */}

            <Link
              href="/anasayfa"
              style={{ backgroundColor: "#1E314A" }}
              className="hover:scale-105 hover:-translate-y-1 hover:shadow-2xl text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-2xl flex items-center gap-2 border border-white/20 group hero-button-one"
            >

              <span>BORSAYA GİRİŞ YAP</span>

              <span className="group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>

            </Link>


            {/* NASIL ÇALIŞIR */}

            <Link
              href="/nasil-calisir"
              className="bg-white/10 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 border border-white/20 hero-button-two"
            >
              Sistem Nasıl Çalışır?
            </Link>

          </div>

        </main>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="relative z-10 px-8 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 border-t border-white/10 gap-4 home-footer">

          <p>
            © 2026 DöngüBorsa • Tüm Hakları Saklıdır.
          </p>

          <div className="flex items-center gap-6">

            <span>Kapsam 3 Emisyon Takibi</span>

            <span>•</span>

            <span>Akıllı Müzakere Terminali</span>

            <span>•</span>

            <span>3.1 MTR Sertifikalı</span>

          </div>

        </footer>

      </div>


      {/* =====================================================
          ANİMASYONLAR
      ====================================================== */}

      <style jsx>{`

        /* =====================================================
           ARKA PLAN YAVAŞ ZOOM
        ====================================================== */

        @keyframes backgroundZoom {
          0% {
            transform: scale(1.05);
          }

          50% {
            transform: scale(1.10);
          }

          100% {
            transform: scale(1.05);
          }
        }

        .home-background {
          animation: backgroundZoom 18s ease-in-out infinite;
        }


        /* =====================================================
           ARKA PLAN IŞIK HAREKETİ
        ====================================================== */

        @keyframes lightMove {
          0% {
            opacity: 0.15;
            transform: translateX(-5%) scale(1);
          }

          50% {
            opacity: 0.30;
            transform: translateX(5%) scale(1.08);
          }

          100% {
            opacity: 0.15;
            transform: translateX(-5%) scale(1);
          }
        }

        .home-light {
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(16, 185, 129, 0.18),
              transparent 35%
            );

          animation: lightMove 10s ease-in-out infinite;
        }


        /* =====================================================
           LOGO SÜZÜLME
        ====================================================== */

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        .logo-float {
          animation: logoFloat 3s ease-in-out infinite;
        }


        /* =====================================================
           HEADER GİRİŞ ANİMASYONU
        ====================================================== */

        @keyframes headerEnter {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .home-header {
          animation: headerEnter 0.8s ease-out forwards;
        }


        /* =====================================================
           ANA BAŞLIK GİRİŞ
        ====================================================== */

        @keyframes heroTitleEnter {
          from {
            opacity: 0;
            transform: translateY(35px);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .hero-title {
          animation: heroTitleEnter 1s ease-out 0.2s both;
        }


        /* =====================================================
           YEŞİL YAZI HAFİF IŞILTI
        ====================================================== */

        @keyframes greenGlow {
          0%,
          100% {
            text-shadow:
              0 0 0px rgba(52, 211, 153, 0);
          }

          50% {
            text-shadow:
              0 0 25px rgba(52, 211, 153, 0.35);
          }
        }

        .hero-green-text {
          animation: greenGlow 4s ease-in-out infinite;
        }


        /* =====================================================
           AÇIKLAMA GİRİŞ
        ====================================================== */

        @keyframes descriptionEnter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-description {
          animation: descriptionEnter 0.8s ease-out 0.7s both;
        }


        /* =====================================================
           İLK BUTON
        ====================================================== */

        @keyframes buttonOneEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-button-one {
          animation: buttonOneEnter 0.7s ease-out 1s both;
        }


        /* =====================================================
           İKİNCİ BUTON
        ====================================================== */

        @keyframes buttonTwoEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-button-two {
          animation: buttonTwoEnter 0.7s ease-out 1.15s both;
        }


        /* =====================================================
           FOOTER
        ====================================================== */

        @keyframes footerEnter {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .home-footer {
          animation: footerEnter 0.8s ease-out 1.3s both;
        }


        /* =====================================================
           HAREKET AZALTMA TERCİHİ
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          .home-background,
          .home-light,
          .logo-float,
          .home-header,
          .hero-title,
          .hero-green-text,
          .hero-description,
          .hero-button-one,
          .hero-button-two,
          .home-footer {
            animation: none;
          }

        }

      `}</style>
    </>
  );
}