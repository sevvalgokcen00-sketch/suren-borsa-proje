"use client";

import Link from "next/link";
import { useState } from "react";

export default function GirisYap() {
  const [userType, setUserType] = useState<"kurumsal" | "bireysel">("kurumsal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify({ ...data.user, userType }));
        }
        window.location.href = "/";
      } else {
        setErrorMessage(data.message || "E-posta veya şifre hatalı!");
      }
    } catch (err) {
      setErrorMessage("Sunucuya bağlanılamadı. Lütfen backend sunucusunun açık olduğunu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-center items-center p-4">
      
      {/* ÜST LOGO */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 flex items-center justify-center text-[#1E314A] text-2xl group-hover:scale-105 transition">
          ♻️
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          Döngü<span className="text-[#1E314A]">Borsa</span>
        </span>
      </Link>

      {/* GİRİŞ KARTI */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6 relative">
        
        {/* ANASAYFAYA DÖN / KAPAT ÇARPI */}
        <Link
          href="/"
          title="Anasayfaya Dön"
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition"
        >
          ✕
        </Link>

        {/* BAŞLIK */}
        <div className="text-center space-y-1.5 pr-6">
          <h1 className="text-2xl font-bold text-slate-900">Hesabınıza Giriş Yapın</h1>
          <p className="text-xs text-slate-500">
            Pazaryerindeki işlemlerinizi yönetmek için hesap türünü seçin.
          </p>
        </div>

        {/* BİREYSEL / KURUMSAL SEÇİM SEKMELERİ */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setUserType("kurumsal")}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              userType === "kurumsal"
                ? "bg-white text-[#1E314A] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🏢 Kurumsal Giriş
          </button>
          <button
            type="button"
            onClick={() => setUserType("bireysel")}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              userType === "bireysel"
                ? "bg-white text-[#1E314A] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            👤 Bireysel Giriş
          </button>
        </div>

        {/* HATA MESAJI */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-semibold">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {userType === "kurumsal" ? "Kurumsal E-Posta Adresi" : "Bireysel E-Posta Adresi"}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={userType === "kurumsal" ? "kurumsal@fabrika.com" : "ornek@gmail.com"}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 text-sm">✉️</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Şifre
              </label>
              <Link href="#" className="text-[11px] font-bold text-[#1E314A] hover:underline">
                Şifremi Unuttum?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl outline-none transition font-medium"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#1E314A] focus:ring-[#1E314A] border-slate-300 accent-[#1E314A] cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-medium">Beni oturumda açık tut</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E314A] hover:bg-[#152336] disabled:bg-[#1E314A]/50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#1E314A]/20 transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <span>{userType === "kurumsal" ? "Kurumsal Giriş Yap →" : "Bireysel Giriş Yap →"}</span>
            )}
          </button>
        </form>

        <div className="text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 font-medium">
            Henüz bir hesabınız yok mu?{" "}
            <Link href="/kayit-ol" className="font-bold text-[#1E314A] hover:underline">
              Kayıt Olun
            </Link>
          </p>
        </div>

      </div>

      <p className="text-[11px] text-slate-400 mt-8 font-medium">
        © 2026 DöngüBorsa • B2B Sürdürülebilir Pazaryeri Platformu
      </p>

    </div>
  );
}