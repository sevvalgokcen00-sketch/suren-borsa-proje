"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Ana Sayfa", href: "/anasayfa", icon: "🌐" },
    { name: "Gösterge Paneli", href: "/gosterge-paneli", icon: "🏠" },
    { name: "Firma Analizi", href: "/firma-analizi", icon: "📊" },
    { name: "İlanlar", href: "/ilanlar-paneli", icon: "📄" },
    { name: "Malzemeler", href: "/malzemeler", icon: "📦" },
    { name: "Teklifler", href: "/teklifler", icon: "🏷️" },
    { name: "Raporlar", href: "/raporlar", icon: "📈" },
    { name: "Ayarlar", href: "/ayarlar", icon: "⚙️" },
  ];

  return (
    <>
      {/* MOBIL HAMBURGER ÜST BAR */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 flex items-center justify-center text-[#1E314A] text-xl group-hover:scale-105 transition">
            ♻️
          </div>
          <span className="text-lg font-black tracking-tight text-[#1E314A]">
            DöngüBorsa
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg hover:bg-slate-200 transition"
          aria-label="Menüyü Aç"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBIL ARKAPLAN KARARTMA */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ASIDE SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto flex-1 pr-1">
          {/* LOGO (DESKTOP) */}
          <div className="hidden lg:flex items-center justify-between px-2 py-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 flex items-center justify-center text-[#1E314A] text-xl group-hover:scale-105 transition">
                ♻️
              </div>
              <span className="text-xl font-black tracking-tight text-[#1E314A]">
                DöngüBorsa
              </span>
            </Link>
          </div>

          {/* MENÜ LİSTESİ */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    backgroundColor: isActive ? "rgba(30, 49, 74, 0.08)" : "transparent",
                    color: isActive ? "#1E314A" : "#475569",
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    !isActive ? "hover:bg-slate-50 hover:text-slate-900" : ""
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ALT BİLGİ KARTI */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 mt-4 shrink-0">
          <span className="text-[10px] font-bold text-[#1E314A] uppercase tracking-wider block">
            Döngüsel Ekonomi
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Atıkları kaynağa dönüştürün, fabrikanıza değer katın.
          </p>
        </div>
      </aside>
    </>
  );
}