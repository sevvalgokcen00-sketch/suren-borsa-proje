"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

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
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* LOGO - Tıklandığında en dıştaki app/page.tsx karşılama sayfasına (/) gider */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
          <div className="w-8 h-8 flex items-center justify-center text-[#1E314A] text-xl group-hover:scale-105 transition">
            ♻️
          </div>
          <span className="text-xl font-black tracking-tight text-[#1E314A]">
            DöngüBorsa
          </span>
        </Link>

        {/* MENÜ LİSTESİ */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
        <span className="text-[10px] font-bold text-[#1E314A] uppercase tracking-wider block">
          Döngüsel Ekonomi
        </span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Atıkları kaynağa dönüştürün, fabrikanıza değer katın.
        </p>
      </div>
    </aside>
  );
}