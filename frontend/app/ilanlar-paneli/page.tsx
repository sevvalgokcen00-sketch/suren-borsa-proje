"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import baseData from "../data/islemler.json";

// Excel veri setindeki resmi ve profesyonel demir-çelik sınıflandırmaları
const excelAltTurler = [
  "Standart Dışı Sac / Levha",
  "İmalat Artığı Profil",
  "DKP (Soğuk Haddelenmiş Sac Artığı)",
  "Kalıp Fazlası Parça",
  "Talaş / Kırpıntı"
];

const companyList = Array.from({ length: 60 }, (_, i) => `Firma ${1001 + i} San. Tic. Ltd. Şti.`);
const cityList = ["Adana", "Bursa", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kocaeli", "Konya", "Manisa", "Sakarya"];

const materialsData = Array.from({ length: 391 }, (_, i) => {
  const original: any = (baseData as any[])[i % baseData.length] || {};
  const idNumber = String(i + 1).padStart(5, '0');
  return {
    ...original,
    id: `T-${idNumber}`,
    title: excelAltTurler[i % excelAltTurler.length],
    company: companyList[i % companyList.length],
    location: original.location || cityList[i % cityList.length],
    hasCertificate: i % 2 === 0, 
    amount: `${( (i * 147) % 4500 + 300 ).toLocaleString("tr-TR")} kg`,
    price: `₺ ${((i * 1.3) % 18 + 9.5).toFixed(2)} / kg`
  };
});

export default function IlanlarPaneli() {
  const [activeTab, setActiveTab] = useState<"aktif" | "benim">("aktif");
  const [filter, setFilter] = useState("Hepsi");
  
  
  const [aktifListings, setAktifListings] = useState<any[]>([]);
  const [benimListings, setBenimListings] = useState<any[]>([]);

        const loadListings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/listings");
      if (res.ok) {
        const raw = await res.json();
        const rawList = Array.isArray(raw) ? raw : (raw.value || raw.listings || []);
        
        if (rawList.length > 0) {
          const formatted = rawList.map((item: any) => ({
            id: item.id ? String(item.id) : "1",
            title: item.title || item.material_type || "Demir - Çelik Kırpıntı",
            amount: item.weight || item.amount || 0,
            price: item.price || 0,
            hasCertificate: item.hasCertificate === 1 || item.hasCertificate === true || true,
            location: item.city || item.locationCity || "Kocaeli",
            status: item.status || "Aktif",
            material_type: item.material_type || ""
          }));

          // En büyük id (en yeni eklenen) en üstte olacak şekilde sırala
          formatted.sort((a: any, b: any) => Number(a.id) - Number(b.id));

          setAktifListings(formatted);
          setBenimListings(formatted);
        } else {
          setAktifListings(materialsData.slice(0, 15));
          setBenimListings(materialsData.slice(15, 20));
        }
      }
    } catch (err) {
      console.error("İlanlar çekilemedi:", err);
      setAktifListings(materialsData.slice(0, 15));
      setBenimListings(materialsData.slice(15, 20));
    }
  };

  useEffect(() => {
    loadListings();
  }, []);


  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice ? parseFloat(editPrice) : undefined,
          amount: editAmount ? parseFloat(editAmount) : undefined
        })
      });
      if (res.ok) {
        setBenimListings((prev: any[]) =>
          prev.map((item: any) =>
            String(item.id) === String(id)
              ? { ...item, price: editPrice || item.price, amount: editAmount || item.amount }
              : item
          )
        );
        setEditingId(null);
        alert("✅ İlan başarıyla güncellendi!");
      } else {
        alert("İlan güncellenirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bu ilanı kalıcı olarak kaldırmak istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setBenimListings((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
        setAktifListings((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
        alert("✅ İlan veritabanından kalıcı olarak silindi.");
      } else {
        alert("İlan silinirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const currentListings = activeTab === "aktif" ? aktifListings : benimListings;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">İlan Yönetim Paneli</h1>
            <p className="text-[11px] text-slate-400">Şirketinize ait borsa ilanları ve ihale durumları</p>
          </div>

          <Link 
            href="/ilan-ver" 
            style={{ backgroundColor: "#123873" }}
            className="hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
          >
            + Yeni İlan Oluştur
          </Link>
        </header>

        {/* İÇERİK (ENİNE GENİŞLETİLDİ) */}
        <main className="w-full px-4 md:px-8 py-8 space-y-6 flex-1">
          
          {/* TABLO KARTI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 w-full">
            
            {/* SEKMELER (TABS) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("aktif")}
                  style={{ borderColor: activeTab === "aktif" ? "#123873" : "transparent", color: activeTab === "aktif" ? "#123873" : "#94a3b8" }}
                  className={`pb-3 border-b-2 transition`}
                >
                  Aktif İlanlar ({aktifListings.length})
                </button>
                <button
                  onClick={() => setActiveTab("benim")}
                  style={{ borderColor: activeTab === "benim" ? "#123873" : "transparent", color: activeTab === "benim" ? "#123873" : "#94a3b8" }}
                  className={`pb-3 border-b-2 transition`}
                >
                  Benim İlanlarım ({benimListings.length})
                </button>
              </div>
              
              <div className="flex gap-2 text-xs">
                {["Hepsi", "Sertifikalı", "Sertifikasız"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{ backgroundColor: filter === tab ? "#123873" : "#f1f5f9", color: filter === tab ? "#ffffff" : "#475569" }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold pb-3">
                    <th className="pb-3 px-3">İlan ID</th>
                    <th className="pb-3 px-3">Malzeme Adı / Alt Tür</th>
                    <th className="pb-3 px-3">Miktar (kg)</th>
                    <th className="pb-3 px-3">Birim Fiyat</th>
                    <th className="pb-3 px-3">Sertifika (3.1)</th>
                    <th className="pb-3 px-3">Konum</th>
                    <th className="pb-3 px-3 text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentListings
                    .filter((item: any) => {
                      if (filter === "Sertifikalı") return item.hasCertificate;
                      if (filter === "Sertifikasız") return !item.hasCertificate;
                      return true;
                    })
                    .map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold" style={{ color: "#123873" }}>{item.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{item.title}</td>
                        
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.amount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="border border-[#123873] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-24 font-bold"
                            />
                          ) : (
                            item.amount
                          )}
                        </td>

                        <td className="py-3 px-3 font-black text-slate-900">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.price}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="border border-[#123873] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-28 font-bold"
                            />
                          ) : (
                            item.price
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.hasCertificate ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border" style={{ backgroundColor: "rgba(18, 56, 115, 0.1)", color: "#123873", borderColor: "rgba(18, 56, 115, 0.2)" }}>
                              ✓ Mevcut
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Yok
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">📍 {item.location}</td>
                        
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {activeTab === "aktif" ? (
                            <>
                              <Link
                                href={`/malzemeler/detay?id=${item.id}`}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block"
                              >
                                Görüntüle
                              </Link>

                              <Link
                                href={`/teklifler?ilan=${item.id}&baslik=${encodeURIComponent(item.title)}&fiyat=${item.price}`}
                                style={{ backgroundColor: "#123873" }}
                                className="hover:opacity-90 text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block shadow-sm"
                              >
                                Teklif Ver / Pazarlık Yap
                              </Link>
                            </>
                          ) : (
                            editingId === item.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  style={{ backgroundColor: "#123873" }}
                                  className="hover:opacity-90 text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Kaydet ✓
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  İptal
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditPrice(item.price);
                                    setEditAmount(item.amount);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Güncelle
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteListing(item.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Kaldır
                                </button>
                              </>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}