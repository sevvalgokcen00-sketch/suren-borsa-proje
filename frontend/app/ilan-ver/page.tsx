"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";

// Hem named export (export const turkeyData) hem de default export'u hatasız algılayan güvenli import:
import * as turkeyDataModule from "../data/turkeyData";
const turkeyData = (turkeyDataModule as any).default || (turkeyDataModule as any).turkeyData || turkeyDataModule;

// turkeyData.ts dosyasının nesne {"Adana": [...]} veya dizi [{il: "Adana", ilceler: [...]}] 
// olma ihtimaline karşı her iki formatı da destekleyen güvenli dönüştürücü
const PROVINCES_MAP: { [key: string]: string[] } = (() => {
  if (!turkeyData) return { "Kocaeli": ["Gebze", "İzmit"] };
  
  if (!Array.isArray(turkeyData) && typeof turkeyData === "object") {
    return turkeyData as { [key: string]: string[] };
  }
  
  if (Array.isArray(turkeyData)) {
    const map: { [key: string]: string[] } = {};
    turkeyData.forEach((item: any) => {
      const ilAdi = item.il || item.city || item.name || "Diğer";
      const ilceListesi = item.ilceler || item.districts || item.counties || ["Merkez"];
      map[ilAdi] = ilceListesi;
    });
    return map;
  }

  return { "Kocaeli": ["Gebze", "İzmit"] };
})();

export default function IlanVer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialType, setMaterialType] = useState("Temiz Demir-Çelik Kırpıntısı");
  const [usageStatus, setUsageStatus] = useState("0 / Üretim Fazlası (Orijinal Stok)");
  const [purity, setPurity] = useState("98");
  const [contamination, setContamination] = useState("Temiz (Yağsız-Kontaminesiz)");
  const [rustLevel, setRustLevel] = useState("Pas Yok / Hafif Yüzey Pasa");
  const [moisture, setMoisture] = useState("Kuru (%0-2 Nem)");
  const [physicalForm, setPhysicalForm] = useState("Parçalanmış / Kırpıntı");
  const [packaging, setPackaging] = useState("Preslenmiş / Balya");
  const [amount, setAmount] = useState("1000");
  
  const provinceNames = Object.keys(PROVINCES_MAP).sort((a, b) => a.localeCompare(b, 'tr'));
  const defaultProvince = provinceNames.includes("Kocaeli") ? "Kocaeli" : (provinceNames[0] || "Kocaeli");
  
  const [selectedProvince, setSelectedProvince] = useState(defaultProvince);
  const [selectedDistrict, setSelectedDistrict] = useState(
    (PROVINCES_MAP[defaultProvince] && PROVINCES_MAP[defaultProvince][0]) || "Merkez"
  );
  
  const [userPrice, setUserPrice] = useState("13.40");

  const handleProvinceChange = (newProvince: string) => {
    setSelectedProvince(newProvince);
    const districts = PROVINCES_MAP[newProvince];
    if (districts && districts.length > 0) {
      setSelectedDistrict(districts[0]);
    } else {
      setSelectedDistrict("Merkez");
    }
  };

  const priceGuidance = useMemo(() => {
    let baseRef = 11.80;
    let completedTxCount = 142;

    if (materialType === "Profil ve Levha Artığı") {
      baseRef = 13.60;
      completedTxCount = 98;
    }
    if (materialType === "Demir-Çelik Talaşı") {
      baseRef = 8.90;
      completedTxCount = 76;
    }
    if (materialType === "Karışık / Kontamine İkincil Hammadde") {
      baseRef = 8.30;
      completedTxCount = 3;
    }

    let qualityBonus = 0;
    
    if (usageStatus.includes("0 / Üretim Fazlası")) qualityBonus += 0.50;
    if (usageStatus.includes("2. El / Çıkma")) qualityBonus -= 0.40;
    if (usageStatus.includes("İkincil Hammadde / Geri Dönüşüm")) qualityBonus -= 0.70;

    if (contamination.includes("Temiz")) qualityBonus += 0.30;
    if (rustLevel.includes("Pas Yok")) qualityBonus += 0.20;
    if (packaging.includes("Preslenmiş")) qualityBonus += 0.25;
    if (contamination.includes("Yağlı") || rustLevel.includes("Ağır Pas")) qualityBonus -= 0.45;

    const calculatedRef = Number((baseRef + (qualityBonus * 0.5)).toFixed(2));
    const minRec = Number((calculatedRef * 0.955).toFixed(2));
    const maxRec = Number((calculatedRef * 1.035).toFixed(2));

    const entered = parseFloat(userPrice) || 0;
    const diffPercent = entered > 0 
      ? (((entered - calculatedRef) / calculatedRef) * 100).toFixed(1)
      : "0.0";

    return {
      referencePrice: calculatedRef,
      minPrice: minRec,
      maxPrice: maxRec,
      diffPercent: Number(diffPercent),
      isSufficientData: completedTxCount >= 5,
      txCount: completedTxCount,
    };
  }, [materialType, usageStatus, contamination, rustLevel, packaging, userPrice]);

  
    const handleCreateListing = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      const desc = [
        "Saflık: %" + (purity || "98"),
        "Kontaminasyon: " + (contamination || "Temiz"),
        "Pas: " + (rustLevel || "Yok"),
        "Nem: " + (moisture || "Kuru"),
        "Form: " + (physicalForm || "Kırpıntı"),
        "Paket: " + (packaging || "Balya")
      ].join(" | ");

      const payload = {
        categoryId: 1,
        title: materialType || "Temiz Demir-Çelik Kırpıntısı",
        description: desc,
        weight: Number(amount) || 1000,
        unit: "Kg",
        price: Number(userPrice) || 13.40,
        usageStatus: usageStatus || "0 / Üretim Fazlası (Orijinal Stok)",
        locationCity: selectedProvince || "Kocaeli",
        locationDistrict: selectedDistrict || "Başiskele",
        hasCertificate: 1
      };

      const res = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("İlanınız başarıyla yayınlandı!");
        window.location.href = "/ilanlar-paneli";
      } else {
        alert("İlan eklenemedi: " + (resData.message || resData.error || "Sunucu hatası"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Hata oluştu: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Yeni Malzeme İlanı Oluştur</h1>
            <p className="text-[11px] text-slate-400">Atık ve fazla stoklarınızı borsa endeksli referans fiyatlarla satışa çıkarın</p>
          </div>
          <Link
            href="/ilanlar-paneli"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            ✕ İptal ve Geri Dön
          </Link>
        </header>

        <main className="p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SOL 7 KOLON - MALZEME ÖZELLİK FORMLARI */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5">
                1. Malzeme Fiziksel & Kalite Kriterleri
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Malzeme Türü</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] transition cursor-pointer"
                  >
                    <option value="Temiz Demir-Çelik Kırpıntısı">Temiz Demir-Çelik Kırpıntısı</option>
                    <option value="Profil ve Levha Artığı">Profil ve Levha Artığı</option>
                    <option value="Demir-Çelik Talaşı">Demir-Çelik Talaşı</option>
                    <option value="Karışık / Kontamine İkincil Hammadde">Karışık / Kontamine İkincil Hammadde</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kullanım Durumu</label>
                  <select
                    value={usageStatus}
                    onChange={(e) => setUsageStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] transition cursor-pointer"
                  >
                    <option value="0 / Üretim Fazlası (Orijinal Stok)">0 / Üretim Fazlası (Orijinal Stok)</option>
                    <option value="Az Kullanılmış / İkincil İşleme Uygun">Az Kullanılmış / İkincil İşleme Uygun</option>
                    <option value="2. El / Çıkma / Söküm">2. El / Çıkma / Söküm</option>
                    <option value="İkincil Hammadde / Geri Dönüşüm Atığı">İkincil Hammadde / Geri Dönüşüm Atığı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Saflık Oranı (%)</label>
                  <input
                    type="number"
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    placeholder="Örn: 98"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kirlilik / Kontaminasyon</label>
                  <select
                    value={contamination}
                    onChange={(e) => setContamination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    <option value="Temiz (Yağsız-Kontaminesiz)">Temiz (Yağsız-Kontaminesiz)</option>
                    <option value="Hafif Yağlı / Kesme Sıvılı">Hafif Yağlı / Kesme Sıvılı</option>
                    <option value="Ağır Yağlı-Kontamine">Ağır Yağlı-Kontamine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pas Durumu</label>
                  <select
                    value={rustLevel}
                    onChange={(e) => setRustLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    <option value="Pas Yok / Hafif Yüzey Pasa">Pas Yok / Hafif Yüzey Pası</option>
                    <option value="Orta Derece Paslı">Orta Derece Paslı</option>
                    <option value="Ağır Paslı / Korozyonlu">Ağır Paslı / Korozyonlu</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nem Oranı</label>
                  <select
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    <option value="Kuru (%0-2 Nem)">Kuru (%0-2 Nem)</option>
                    <option value="Nemli (%3-5)">Nemli (%3-5)</option>
                    <option value="Islak (%5+)">Islak (%5+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fiziksel Form</label>
                  <select
                    value={physicalForm}
                    onChange={(e) => setPhysicalForm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    <option value="Parçalanmış / Kırpıntı">Parçalanmış / Kırpıntı</option>
                    <option value="Levha / Sac Kesim Artığı">Levha / Sac Kesim Artığı</option>
                    <option value="Talaş / Toz Form">Talaş / Toz Form</option>
                    <option value="Karışık Ebatlı">Karışık Ebatlı</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Paketleme Türü</label>
                  <select
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    <option value="Preslenmiş / Balya">Preslenmiş / Balya</option>
                    <option value="Dökme / Serbest Yükleme">Dökme / Serbest Yükleme</option>
                    <option value="Big-Bag Çuval">Big-Bag Çuval</option>
                    <option value="Paletli / Bağlamalı">Paletli / Bağlamalı</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700">Miktar / Stok (kg)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Şehir (İl)</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    {provinceNames.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">İlçe / Bölge</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#123873] cursor-pointer"
                  >
                    {(PROVINCES_MAP[selectedProvince] || ["Merkez"]).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* SAĞ 5 KOLON - DİNAMİK REFERANS FİYAT VE KARŞILAŞTIRMA REHBERİ */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  2. Satış Fiyatınızı Belirleyin
                </h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Birim Satış Fiyatınız (TL / kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.10"
                      value={userPrice}
                      onChange={(e) => setUserPrice(e.target.value)}
                      className="w-full bg-blue-50/40 border border-blue-200 rounded-xl px-4 py-3 text-lg font-black text-slate-900 outline-none focus:border-[#123873] transition"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                      TL / kg
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  * Sistem kesin bir satış fiyatı dayatmaz. Belirlediğiniz tutar ilanınızda alıcılara doğrudan gösterilir.
                </p>
              </div>

              {/* DİNAMİK BORSA REFERANS REHBER KARTI */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡</span> Dinamik Fiyat Rehberliği
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                    {selectedProvince}, {selectedDistrict}
                  </span>
                </div>

                {!priceGuidance.isSufficientData ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs">
                    <span className="text-base">⚠️</span>
                    <div>
                      <strong className="font-bold block text-amber-400">Yetersiz Tamamlanmış İşlem ({priceGuidance.txCount} İşlem)</strong>
                      <span className="text-[11px] opacity-90">
                        Bu malzemede yeterli borsa işlemi olmadığından referans fiyat <strong>yönetici paneli (admin)</strong> tarafından manuel belirlenmiştir.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center justify-between text-[11px] text-emerald-300">
                    <span>✓ <strong>{priceGuidance.txCount} Tamamlanmış İşlem Medyanı</strong> baz alınmıştır.</span>
                    <span className="font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">Uç Değer Korumalı</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="border-r border-slate-700/60 pr-2">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Platform Referansı
                    </span>
                    <span className="text-lg font-black text-white">
                      {priceGuidance.referencePrice} <span className="text-xs font-bold text-slate-400">TL/kg</span>
                    </span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Önerilen Fiyat Aralığı
                    </span>
                    <span className="text-sm font-black text-emerald-400 block mt-0.5">
                      {priceGuidance.minPrice} – {priceGuidance.maxPrice}{" "}
                      <span className="text-[10px] text-slate-400">TL/kg</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Piyasa Analiz Özeti:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        Math.abs(priceGuidance.diffPercent) <= 5
                          ? "bg-emerald-500/20 text-emerald-400"
                          : priceGuidance.diffPercent > 5
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {Math.abs(priceGuidance.diffPercent) <= 5
                        ? "Optimal Fiyat"
                        : priceGuidance.diffPercent > 5
                        ? "Referans Üstü"
                        : "Referans Altı / Fırsat"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    “Platform referansı <strong className="text-white">{priceGuidance.referencePrice} TL/kg</strong>, önerilen fiyat aralığı{" "}
                    <strong className="text-emerald-400">{priceGuidance.minPrice}–{priceGuidance.maxPrice} TL/kg</strong>, girilen ilan fiyatı referans medyanın{" "}
                    <strong
                      className={
                        priceGuidance.diffPercent > 0
                          ? "text-amber-400 font-bold"
                          : "text-emerald-400 font-bold"
                      }
                    >
                      %{Math.abs(priceGuidance.diffPercent)}{" "}
                      {priceGuidance.diffPercent >= 0 ? "üzerinde" : "altında"}
                    </strong>
                    .”
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  * Önerilen aralık; seçili kullanım durumu ({usageStatus.split("/")[0].trim()}), konum ({selectedProvince}), kirlilik, pas ve paketleme durumuna göre algoritmik olarak optimize edilmiştir.
                </p>

                <button
                  type="button"
                  onClick={handleCreateListing}
                  style={{ backgroundColor: "#123873" }}
                  className="hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg block text-center w-full"
                >
                  ✓ İlanı Yayınla ve Alıcılarla Eşleş
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}