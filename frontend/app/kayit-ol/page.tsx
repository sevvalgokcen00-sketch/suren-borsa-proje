"use client";

import Link from "next/link";
import { useState } from "react";
import { apiUrl } from "@/lib/api";

export default function KayitOl() {
  const [userType, setUserType] = useState<"kurumsal" | "bireysel">("kurumsal");
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedTerms) {
      setErrorMessage("Lütfen kullanım koşullarını kabul edin.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Hesabınız başarıyla oluşturuldu!");
        window.location.href = "/";
      } else {
        setErrorMessage(data.message || "Kayıt işlemi başarısız oldu.");
      }
    } catch (err) {
      setErrorMessage("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-center items-center p-4 py-8">
      
      {/* ÜST LOGO */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-10 h-10 flex items-center justify-center text-[#1E314A] text-2xl group-hover:scale-105 transition">
          ♻️
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          Döngü<span className="text-[#1E314A]">Borsa</span>
        </span>
      </Link>

      {/* KAYIT KARTI */}
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6 relative">
        
        <Link href="/" className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition">✕</Link>

        <div className="text-center space-y-1.5 pr-6">
          <h1 className="text-2xl font-bold text-slate-900">Hesabınızı Oluşturun</h1>
          <p className="text-xs text-slate-500">Döngüsel ekonomi pazaryerine katılarak atık malzemelerinizi ticarete dönüştürün.</p>
        </div>

        {/* HESAP TÜRÜ SEÇİMİ */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button type="button" onClick={() => setUserType("kurumsal")} className={`py-2 text-xs font-bold rounded-xl transition ${userType === "kurumsal" ? "bg-white text-[#1E314A] shadow-sm" : "text-slate-500"}`}>🏢 Kurumsal</button>
          <button type="button" onClick={() => setUserType("bireysel")} className={`py-2 text-xs font-bold rounded-xl transition ${userType === "bireysel" ? "bg-white text-[#1E314A] shadow-sm" : "text-slate-500"}`}>👤 Bireysel</button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-2xl font-semibold">⚠️ {errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Ad Soyad *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Ahmet Yılmaz" className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition" />
            </div>
            
            {userType === "kurumsal" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Firma Adı *</label>
                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="Döngü Metal A.Ş." className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">E-Posta *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ornek@firma.com" className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Telefon *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="0555 123 45 67" className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Şifre *</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} placeholder="En az 6 karakter" className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 text-xs font-bold">{showPassword ? "Gizle 👁️" : "Göster 👁️"}</button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="w-4 h-4 rounded text-[#1E314A] focus:ring-[#1E314A] border-slate-300 accent-[#1E314A] mt-0.5" />
              <span className="text-xs text-slate-600 font-medium leading-relaxed">
                <Link href="#" className="font-bold text-[#1E314A] hover:underline">Kullanım Koşulları</Link>'nı ve <Link href="#" className="font-bold text-[#1E314A] hover:underline">Gizlilik Politikası</Link>'nı kabul ediyorum.
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#1E314A] hover:bg-[#152336] disabled:bg-[#1E314A]/50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#1E314A]/20 transition text-sm">
            {loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur →"}
          </button>
        </form>

        <div className="text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 font-medium">
            Zaten bir hesabınız var mı? <Link href="/giris-yap" className="font-bold text-[#1E314A] hover:underline">Giriş Yapın</Link>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-6 font-medium">© 2026 DöngüBorsa • B2B Sürdürülebilir Pazaryeri</p>
    </div>
  );
}