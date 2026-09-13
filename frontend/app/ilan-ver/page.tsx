"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiUrl } from "@/lib/api";

export default function IlanVer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Temiz Kırpıntı",
    materialName: "",
    weightKg: "",
    pricePerKg: "",
    city: "Kocaeli",
    description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("İlan vermek için lütfen önce giriş yapın.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/listings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("✅ İlanınız başarıyla yayınlandı!");
        setFormData({
          title: "",
          category: "Temiz Kırpıntı",
          materialName: "",
          weightKg: "",
          pricePerKg: "",
          city: "Kocaeli",
          description: "",
        });
      } else {
        setErrorMessage(data.message || data.error || "İlan yayınlanırken bir hata oluştu.");
      }
    } catch (err) {
      setErrorMessage("Sunucuya bağlanılamadı. Lütfen backend sunucusunun açık olduğunu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col lg:flex-row text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Yeni İlan Oluştur</h1>
            <p className="text-[11px] text-slate-400">Demir-çelik hurda ve üretim artığı stoklarınızı borsada değerlendirin</p>
          </div>

          <div className="flex items-center justify-end gap-4 text-xs">
            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex items-center gap-2">
              {isLoggedIn ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl">
                  ✓ Oturum Açık (Yetkili Kurum)
                </span>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link href="/giris-yap" className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">
                    Giriş Yap
                  </Link>
                  <Link href="/kayit-ol" className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN FORM CONTAINER */}
        <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {!isLoggedIn && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-2xl flex items-center gap-3">
                <span>🔒</span>
                <div>
                  <span className="font-bold">Uyarı:</span> İlan oluşturabilmek için sistemde kurumsal veya bireysel olarak oturum açmış olmanız gerekmektedir. Önce <Link href="/giris-yap" className="underline font-bold">Giriş Yapın</Link>.
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-2xl flex items-center gap-2 font-semibold">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl flex items-center gap-2 font-semibold">
                <span>🎉</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">İlan Başlığı</label>
                  <input
                    type="text"
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Örn: Fabrika Çıkışlı DKP Ekstra Temiz Çelik Kırpıntısı"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Kategori</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition cursor-pointer"
                  >
                    <option value="Temiz Kırpıntı">Temiz Kırpıntı</option>
                    <option value="Profil & Boru">Profil & Boru</option>
                    <option value="Talaş & Toz">Talaş & Toz</option>
                    <option value="Üretim Artığı">Üretim Artığı</option>
                    <option value="Sac & Levha">Sac & Levha</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Malzeme Adı / Kalitesi</label>
                  <input
                    type="text"
                    required
                    name="materialName"
                    value={formData.materialName}
                    onChange={handleChange}
                    placeholder="Örn: S235JR / ST37"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Miktar (Kg)</label>
                  <input
                    type="number"
                    required
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    placeholder="Örn: 25000"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Birim Fiyat (TL / Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    placeholder="Örn: 11.80"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Bulunduğu Şehir / Tesis</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Örn: Kocaeli / Gebze OSB"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Açıklama ve Detaylar</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Malzemenin durumu, paketleme şekli, yükleme koşulları vb. detayları yazın..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-2xl outline-none font-medium transition resize-none"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !isLoggedIn}
                  className="w-full sm:w-auto bg-[#1E314A] hover:bg-[#152336] disabled:bg-slate-300 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-lg shadow-[#1E314A]/20 text-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Yayınlanıyor...</span>
                    </>
                  ) : (
                    <span>İlanı Borsada Yayınla →</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </main>

      </div>
    </div>
  );
}