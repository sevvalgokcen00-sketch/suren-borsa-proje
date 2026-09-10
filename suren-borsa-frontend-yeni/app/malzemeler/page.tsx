"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import SteelPriceIndex from "../../components/SteelPriceIndex";
import baseData from "../data/islemler.json";

// Excel Dosyasındaki (Ham_Veri) Resmi Demir-Çelik ve İşlenmemiş Üretim Artığı Sınıflandırmaları
const excelAltTurler = [
  "Standart Dışı Sac / Levha",
  "İmalat Artığı Profil",
  "DKP (Soğuk Haddelenmiş Sac Artığı)",
  "Kalıp Fazlası Parça",
  "Talaş / Kırpıntı"
];

// Excel Dosyasındaki Resmi Malzeme Durumları (Kondisyonlar)
const materialConditions = [
  "Üretim Fazlası",
  "Kesim/İşleme Artığı",
  "Temiz",
  "Orijinal Ambalajında Fazla Stok",
  "Standart Dışı Üretim"
];

const packagingTypes = ["Gevşek", "Preslenmiş-Balya", "Parçalanmış"]; 
const companyList = Array.from({ length: 60 }, (_, i) => `Firma ${1001 + i} San. Tic. Ltd. Şti.`);
const cityList = ["Adana", "Bursa", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kocaeli", "Konya", "Manisa", "Sakarya"];

const materialsData = Array.from({ length: 391 }, (_, i) => {
  const original = (baseData as any[])[i % baseData.length] || {};
  const idNumber = String(i + 1).padStart(5, "0");
  return {
    ...original,
    id: `T-${idNumber}`,
    title: excelAltTurler[i % excelAltTurler.length],
    company: companyList[i % companyList.length], 
    condition: materialConditions[i % materialConditions.length],
    packaging: packagingTypes[i % packagingTypes.length], 
    location: original.location || cityList[i % cityList.length]
  };
});

export default function Malzemeler() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIndex, setShowIndex] = useState(true);

  const [selectedMaterialType, setSelectedMaterialType] = useState("Hepsi");
  const [selectedCompany, setSelectedCompany] = useState("Hepsi");
  const [selectedCondition, setSelectedCondition] = useState("Hepsi");
  const [selectedCity, setSelectedCity] = useState("Hepsi");
  const [selectedPackaging, setSelectedPackaging] = useState("Hepsi");

  const [appliedFilters, setAppliedFilters] = useState({
    materialType: "Hepsi",
    company: "Hepsi",
    condition: "Hepsi",
    city: "Hepsi",
    packaging: "Hepsi"
  });

  const materials = Array.isArray(materialsData) ? materialsData : [];

  const filteredMaterials = materials.filter((item: any) => {
    const matchesMaterial = appliedFilters.materialType === "Hepsi" || item.title === appliedFilters.materialType;
    const matchesCompany = appliedFilters.company === "Hepsi" || item.company === appliedFilters.company;
    const matchesCondition = appliedFilters.condition === "Hepsi" || item.condition === appliedFilters.condition;
    const matchesPackaging = appliedFilters.packaging === "Hepsi" || item.packaging === appliedFilters.packaging;
    const matchesCity = appliedFilters.city === "Hepsi" || (item.location && item.location.toLowerCase() === appliedFilters.city.toLowerCase());

    return matchesMaterial && matchesCompany && matchesCondition && matchesPackaging && matchesCity;
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      materialType: selectedMaterialType,
      company: selectedCompany,
      condition: selectedCondition,
      city: selectedCity,
      packaging: selectedPackaging
    });
  };

  const handleClearFilters = () => {
    setSelectedMaterialType("Hepsi");
    setSelectedCompany("Hepsi");
    setSelectedCondition("Hepsi");
    setSelectedCity("Hepsi");
    setSelectedPackaging("Hepsi");
    setAppliedFilters({
      materialType: "Hepsi",
      company: "Hepsi",
      condition: "Hepsi",
      city: "Hepsi",
      packaging: "Hepsi"
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-end gap-4">
          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔{" "}
              <span className="absolute -top-1 -right-1 bg-[#1E314A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                4
              </span>
            </button>

            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#1E314A] text-white font-bold flex items-center justify-center text-xs">
                    AY
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Ahmet Yılmaz</p>
                    <p className="text-[10px] text-slate-400">Döngü Metal A.Ş.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
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

        {/* ANA MALZEMELER İÇERİĞİ (ENİNE GENİŞLETİLDİ) */}
        <main className="w-full px-4 md:px-8 py-8 space-y-6 flex-1">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                📈 Medyan Referans Fiyat Endeksi
              </span>
              <button onClick={() => setShowIndex(!showIndex)} className="text-xs text-[#1E314A] font-bold hover:underline">
                {showIndex ? "▲ Endeksi Gizle" : "▼ Piyasa Endeksini Göster"}
              </button>
            </div>
            {showIndex && <SteelPriceIndex />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Demir-Çelik Malzeme Kataloğu ({filteredMaterials.length} Sonuç)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Fabrikalardan arta kalan işlenmemiş ham üretim artığı ve kesim firelerini filtrelere göre listeliyoruz.
              </p>
            </div>

            <Link href="/ilan-ver" className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Malzeme İlanı Ekle
            </Link>
          </div>

          {/* 🔍 FİLTRELEME ÇUBUĞU */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Malzeme Tipi / İlan Adı
                </label>
                <select
                  value={selectedMaterialType}
                  onChange={(e) => setSelectedMaterialType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-slate-700"
                >
                  <option value="Hepsi">Tüm Malzemeler</option>
                  {excelAltTurler.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tedarikçi Firma Seçimi
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-slate-700"
                >
                  <option value="Hepsi">Tüm Firmalar</option>
                  {companyList.map(company => <option key={company} value={company}>{company}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Paketleme Biçimi
                </label>
                <select
                  value={selectedPackaging}
                  onChange={(e) => setSelectedPackaging(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-slate-700"
                >
                  <option value="Hepsi">Tüm Paketlemeler</option>
                  {packagingTypes.map(pack => <option key={pack} value={pack}>{pack}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Malzeme Durumu (Kondisyon)
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-[#1E314A]"
                >
                  <option value="Hepsi">Tüm Durumlar</option>
                  {materialConditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Depo / Teslimat Konumu
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-slate-700"
                >
                  <option value="Hepsi">📍 Şehirler</option>
                  {cityList.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleClearFilters}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Sıfırla
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="w-2/3 bg-[#1E314A] hover:bg-[#152336] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </div>
          </div>

          {/* MALZEME KARTLARI GRİDİ (ENİNE GENİŞLETİLDİ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {filteredMaterials.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#1E314A] bg-[#1E314A]/10 px-2 py-0.5 rounded-md border border-[#1E314A]/20">
                      {item.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                        {item.condition}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1E314A] transition line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1 line-clamp-1">
                      <span>🏢</span> {item.company}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100/80 font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Durum:</span>
                    <span className="font-bold text-[#1E314A] bg-[#1E314A]/10 px-2 py-0.5 rounded">
                      {item.condition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Paketleme:</span>
                    <span className="font-bold text-slate-700">{item.packaging}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Stok:</span>
                    <span className="font-bold text-slate-900">{item.amount || '10.000 kg'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Konum:</span>
                    <span className="font-semibold text-slate-700">{item.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Birim Fiyat
                    </span>
                    <span className="text-sm font-black text-slate-900">{item.price || '₺12,50/kg'}</span>
                  </div>

                  <Link href={`/malzemeler/detay?id=${item.id.replace("T-", "")}`} className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
                    Görüntüle
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2 w-full">
              <span className="text-3xl">🔍</span>
              <h3 className="font-bold text-slate-800 text-sm">
                Aradığınız kriterlerde malzeme bulunamadı.
              </h3>
              <p className="text-xs text-slate-400">
                Lütfen seçimlerinizi değiştirip tekrar "Filtreleri Uygula" butonuna basın.
              </p>
              <button 
                onClick={handleClearFilters}
                className="mt-4 text-xs font-bold text-[#1E314A] hover:underline"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}