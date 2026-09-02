"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Gösterge Paneli", href: "/gosterge-paneli", icon: "🏠" },
    { name: "Firma Analizi", href: "/firma-analizi", icon: "📊" },
    { name: "İlanlar", href: "/ilanlar-paneli", icon: "📄" },
    { name: "Malzemeler", href: "/malzemeler", icon: "📦" },
    { name: "Teklifler", href: "/teklifler", icon: "🏷️" },
    { name: "Raporlar", href: "/raporlar", icon: "📈" },
    { name: "Ayarlar", href: "/ayarlar", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 hidden md:flex min-h-screen">
      <div className="space-y-6">
        
        {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 font-black text-xl text-slate-900 px-2 group">
      <div className="w-9 h-9 flex items-center justify-center text-[#1E314A] text-2xl group-hover:scale-105 transition">
       ♻️
      </div>
      <span>
        Döngü<span className="text-[#1E314A]">Borsa</span>
      </span>
      </Link>

        {/* MENÜ LİNKLERİ */}
        <nav className="space-y-1 text-sm font-semibold">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition duration-150 ${
                  isActive
                    ? "bg-[#1E314A]/10 text-[#1E314A] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SOL ALT BANNER */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
        <p className="font-bold text-slate-900">Döngüsel Ekonomi</p>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          Atıkları kaynağa dönüştürün, fabrikanıza değer katın.
        </p>
        <button className="text-[#1E314A] font-bold hover:underline block pt-1">
          Daha Fazla Bilgi →
        </button>
      </div>
    </aside>
  );
}