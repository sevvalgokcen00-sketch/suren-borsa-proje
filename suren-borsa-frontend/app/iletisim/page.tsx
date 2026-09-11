"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function IletisimPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Büyük Tonajlı Alım-Satım / İhale");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Buraya API post isteği bağlanabilir
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      {/* SOL MENÜ */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>💬</span> Kurumsal İletişim & Destek
            </h1>
            <p className="text-xs text-slate-400">
              Endüstriyel demir-çelik ticareti, kurumsal üyelikler ve teknik destek için yanınızdayız
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-[#1E314A] transition"
          >
            ← Ana Sayfaya Dön
          </Link>
        </header>

        {/* ANA İÇERİK (Üstteki adres ve bilgi kartları tamamen kaldırıldı) */}
        <main className="p-6 max-w-6xl mx-auto w-full space-y-8">
          
          {/* FORM VE SAĞ BİLGİ ALANI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SOL 7 KOLON: İLETİŞİM FORMU */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-1">
                Bize Mesaj Gönderin
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Formu doldurduğunuzda endüstriyel müşteri temsilcimiz en geç 2 saat içinde dönüş yapacaktır.
              </p>

              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl mx-auto font-bold">
                    ✓
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Mesajınız Alındı!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sayın <strong className="text-slate-900">{name}</strong>, talebiniz operasyon ekibimize iletilmiştir. En kısa sürede sizinle iletişime geçeceğiz.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 bg-[#1E314A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Adınız Soyadınız *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#1E314A] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Firma / Fabrika Adı *</label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Örn: Yılmazlar Çelik A.Ş."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#1E314A] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kurumsal E-Posta *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ahmet@yilmazlar.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#1E314A] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Telefon Numarası *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0 (5XX) XXX XX XX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#1E314A] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Konu</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#1E314A] transition cursor-pointer"
                    >
                      <option value="Büyük Tonajlı Alım-Satım / İhale">Büyük Tonajlı Alım-Satım / İhale</option>
                      <option value="Kurumsal Hesap & Doğrulama Destek">Kurumsal Hesap & Doğrulama Destek</option>
                      <option value="Fiyat Referans & Medyan İtirazı / Sorusu">Fiyat Referans & Medyan İtirazı / Sorusu</option>
                      <option value="3.1 MTR Sertifika Entegrasyonu">3.1 MTR Sertifika Entegrasyonu</option>
                      <option value="Diğer Konular">Diğer Konular</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mesajınız *</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Lütfen tedarik veya satış yapmak istediğiniz malzeme türü, tahmini tonaj ve bölge bilginizi belirtin..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs outline-none focus:border-[#1E314A] transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1E314A] hover:bg-[#152336] text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md shadow-[#1E314A]/20"
                  >
                    💬 Talebi İlet ve Temsilciyle Eşleş
                  </button>
                </form>
              )}
            </div>

            {/* SAĞ 5 KOLON: SSS, OPERASYON SAATLERİ VE TELEFON/E-POSTA BİLGİLERİ */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* SIKÇA SORULAN SORULAR */}
              <div className="bg-gradient-to-br from-slate-900 via-[#132030] to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <span className="bg-[#1E314A] text-[#6C96CF] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Sıkça Sorulan Sorular
                </span>
                <h3 className="text-base font-black text-white">
                  Neden DöngüBorsa ile Ticaret?
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-white block">Doğrulanmış B2B Ağı</strong>
                      Yalnızca vergi levhası onaylı fabrikalar ve sanayi firmaları işlem açabilir.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-white block">Medyan Endeks Koruması</strong>
                      Fiyat manipülasyonlarına karşı platform içi referanslar uç değerlerden etkilenmez.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-white block">ESG ve Kapsam 3 Raporlaması</strong>
                      Tamamlanan her ton çelik geri kazanımı için ISO uyumlu karbon tasarruf belgesi sunulur.
                    </div>
                  </li>
                </ul>
              </div>

              {/* OPERASYON SAATLERİ KARTI */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="text-xs font-bold text-slate-400">OPERASYON SAATLERİ</div>
                <div className="text-sm font-black text-slate-900">Pazartesi – Cuma: 08:30 – 18:00</div>
                <p className="text-[11px] text-slate-500">
                  Hafta sonları ve resmi tatillerde yalnızca borsa tahtası endeks takibi aktiftir; canlı destek hizmeti verilmez.
                </p>
              </div>

              {/* OPERASYON SAATLERİNİN ALTINA TAŞINAN HAT & E-POSTA KARTLARI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                    📞
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Borsa Hattı</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hafta içi canlı destek: <br />
                    <strong className="text-slate-800 font-mono">+90 (262) 500 00 00</strong>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                    ✉️
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">E-Posta</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sorgu ve ihaleler için: <br />
                    <strong className="text-slate-800">destek@donguborsa.com</strong>
                  </p>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}