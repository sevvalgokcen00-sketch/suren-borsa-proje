"use client";

import Link from "next/link";
import { useState } from "react";

export default function KayitOl() {
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
      setErrorMessage("Lütfen kullanım koşullarını ve gizlilik politikasını kabul edin.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        alert("Hesabınız başarıyla oluşturuldu!");
        window.location.href = "/";
      } else {
        setErrorMessage(data.message || "Kayıt işlemi başarısız oldu.");
      }
    } catch (err) {
      setErrorMessage("Sunucuya bağlanılamadı. Lütfen backend sunucusunun çalıştığından emin olun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-center items-center p-4 py-8">
      
      {/* ÜST LOGO */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
          ♻️
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          Döngü<span className="text-emerald-600">Borsa</span>
        </span>
      </Link>

      {/* KAYIT KARTI */}
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6 relative">
        
        {/* ANASAYFAYA DÖN / KAPAT ÇARPI İŞARETİ */}
        <Link
          href="/"
          title="Anasayfaya Dön"
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition"
        >
          ✕
        </Link>

        {/* BAŞLIK */}
        <div className="text-center space-y-1.5 pr-6">
          <h1 className="text-2xl font-bold text-slate-900">Kurumsal Hesabınızı Oluşturun</h1>
          <p className="text-xs text-slate-500">
            Döngüsel ekonomi pazaryerine katılarak atık malzemelerinizi ticarete dönüştürün.
          </p>
        </div>

        {/* HATA BİLDİRİMİ */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-semibold">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AD SOYAD */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
            </div>

            {/* FİRMA ADI */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Firma Adı *
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Örn: Döngü Metal A.Ş."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* E-POSTA */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                E-Posta Adresi *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@firma.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
            </div>

            {/* TELEFON */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0555 123 45 67"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
            </div>
          </div>

          {/* ŞİFRE */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Şifre Oluşturun *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                {showPassword ? "Gizle 👁️" : "Göster 👁️"}
              </button>
            </div>
          </div>

          {/* SÖZLEŞME ONAYI */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer mt-0.5"
              />
              <span className="text-xs text-slate-600 font-medium leading-relaxed">
                <Link href="#" className="font-bold text-emerald-600 hover:underline">Kullanım Koşulları</Link>'nı ve{" "}
                <Link href="#" className="font-bold text-emerald-600 hover:underline">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
              </span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition text-sm flex items-center justify-center gap-2 pt-3"
          >
            {loading ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                <span>Hesap Oluşturuluyor...</span>
              </>
            ) : (
              <span>Hesap Oluştur →</span>
            )}
          </button>
        </form>

        {/* ALT YÖNLENDİRME */}
        <div className="text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 font-medium">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/giris-yap" className="font-bold text-emerald-600 hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </div>

      </div>

      {/* ALT BİLGİ */}
      <p className="text-[11px] text-slate-400 mt-6 font-medium">
        © 2026 DöngüBorsa • B2B Sürdürülebilir Pazaryeri Platformu
      </p>

    </div>
  );
}