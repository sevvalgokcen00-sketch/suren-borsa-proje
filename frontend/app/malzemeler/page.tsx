"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import SteelPriceIndex from "../../components/SteelPriceIndex";
import { apiFetch } from "@/lib/api";
import {
  Listing,
  listingMaterial,
  listingCity,
  listingCondition,
  listingWeight,
  listingPrice,
  listingImages,
} from "@/lib/types";

const HEPSI = "Hepsi";

export default function Malzemeler() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showIndex, setShowIndex] = useState(true);

  // Sunucudan gelen ilanlar
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Açılır liste seçenekleri filtresiz veri kümesinden türetilir
  const [optionSource, setOptionSource] = useState<Listing[]>([]);

  // Form durumu (henüz uygulanmamış seçimler)
  const [searchText, setSearchText] = useState("");
  const [selectedMaterialType, setSelectedMaterialType] = useState(HEPSI);
  const [selectedCondition, setSelectedCondition] = useState(HEPSI);
  const [selectedCity, setSelectedCity] = useState(HEPSI);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Uygulanmış istemci tarafı filtreler
  const [appliedClient, setAppliedClient] = useState({
    materialType: HEPSI,
    city: HEPSI,
  });

  const loadListings = useCallback(
    async (opts?: {
      search?: string;
      condition?: string;
      minPrice?: string;
      maxPrice?: string;
      isInitial?: boolean;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (opts?.search) qs.set("search", opts.search);
        if (opts?.condition && opts.condition !== HEPSI) qs.set("materialType", opts.condition);
        if (opts?.minPrice) qs.set("minPrice", opts.minPrice);
        if (opts?.maxPrice) qs.set("maxPrice", opts.maxPrice);

        const query = qs.toString();
        const data = await apiFetch<Listing[]>(`/api/listings${query ? `?${query}` : ""}`);
        const rows = Array.isArray(data) ? data : [];
        setListings(rows);
        if (opts?.isInitial) setOptionSource(rows);
      } catch (err) {
        console.error("İlanlar çekilemedi:", err);
        setListings([]);
        setError(
          err instanceof Error
            ? "İlanlar sunucudan alınamadı. Lütfen birkaç saniye sonra tekrar deneyin."
            : "Bilinmeyen bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadListings({ isInitial: true });
  }, [loadListings]);

  const materialTypeOptions = useMemo(
    () => Array.from(new Set(optionSource.map(listingMaterial))).sort((a, b) => a.localeCompare(b, "tr")),
    [optionSource]
  );
  const conditionOptions = useMemo(
    () =>
      Array.from(new Set(optionSource.map((l) => l.usageStatus).filter((v): v is string => !!v))).sort((a, b) =>
        a.localeCompare(b, "tr")
      ),
    [optionSource]
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(optionSource.map(listingCity))).sort((a, b) => a.localeCompare(b, "tr")),
    [optionSource]
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((l) => {
        const matchesMaterial =
          appliedClient.materialType === HEPSI || listingMaterial(l) === appliedClient.materialType;
        const matchesCity = appliedClient.city === HEPSI || listingCity(l) === appliedClient.city;
        return matchesMaterial && matchesCity;
      }),
    [listings, appliedClient]
  );

  const handleApplyFilters = () => {
    setAppliedClient({ materialType: selectedMaterialType, city: selectedCity });
    loadListings({
      search: searchText.trim(),
      condition: selectedCondition,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
    });
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedMaterialType(HEPSI);
    setSelectedCondition(HEPSI);
    setSelectedCity(HEPSI);
    setMinPrice("");
    setMaxPrice("");
    setAppliedClient({ materialType: HEPSI, city: HEPSI });
    loadListings({ isInitial: true });
  };

  const selectClass =
    "w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer font-bold text-slate-700";
  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col lg:flex-row text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-end gap-4">
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
                  <div className="w-8 h-8 rounded-full bg-[#1E314A] text-white font-bold flex items-center justify-center text-xs shrink-0">
                    AY
                  </div>
                  <button onClick={() => setIsLoggedIn(false)} className="font-bold text-slate-500 hover:text-red-500 transition">
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/giris-yap" className="font-bold text-slate-600 hover:text-[#1E314A] transition px-3 py-2">
                    Giriş Yap
                  </Link>
                  <Link href="/kayit-ol" className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-5 w-full overflow-y-auto">
          {showIndex && (
            <div className="w-full">
              <SteelPriceIndex />
            </div>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">İkincil Hammadde Borsası</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Fabrikalardan arta kalan işlenmemiş ham üretim artığı ve kesim firelerini filtrelere göre listeliyoruz.
              </p>
            </div>

            <Link
              href="/ilan-ver"
              className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 shrink-0"
            >
              <span>+</span> Malzeme İlanı Ekle
            </Link>
          </div>

          {/* 🔍 FİLTRELEME ÇUBUĞU */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>İlan Ara (Başlık / Açıklama)</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  placeholder="örn. sac, profil, hurda"
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1E314A] font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className={labelClass}>Malzeme Tipi</label>
                <select value={selectedMaterialType} onChange={(e) => setSelectedMaterialType(e.target.value)} className={selectClass}>
                  <option value={HEPSI}>Tüm Malzemeler</option>
                  {materialTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Malzeme Durumu (Kondisyon)</label>
                <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)} className={selectClass}>
                  <option value={HEPSI}>Tüm Durumlar</option>
                  {conditionOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 items-end">
              <div>
                <label className={labelClass}>Depo / Teslimat Konumu</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={selectClass}>
                  <option value={HEPSI}>📍 Tüm Şehirler</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Birim Fiyat Aralığı (₺/kg)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="En az"
                    className="w-1/2 bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#1E314A] font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="En çok"
                    className="w-1/2 bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#1E314A] font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                  />
                </div>
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
                  disabled={loading}
                  className="w-2/3 bg-[#1E314A] hover:bg-[#152336] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  {loading ? "Yükleniyor..." : "Filtreleri Uygula"}
                </button>
              </div>
            </div>
          </div>

          {/* YÜKLENİYOR */}
          {loading && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2 w-full">
              <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[#1E314A] rounded-full animate-spin" />
              <h3 className="font-bold text-slate-800 text-sm pt-2">İlanlar yükleniyor...</h3>
              <p className="text-xs text-slate-400">
                Sunucu bir süredir boştaysa ilk yanıt birkaç saniye sürebilir.
              </p>
            </div>
          )}

          {/* HATA */}
          {!loading && error && (
            <div className="bg-white p-12 text-center rounded-2xl border border-red-200 space-y-2 w-full">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-bold text-red-700 text-sm">{error}</h3>
              <button onClick={() => loadListings({ isInitial: true })} className="mt-3 text-xs font-bold text-[#1E314A] hover:underline">
                Tekrar Dene
              </button>
            </div>
          )}

          {/* MALZEME KARTLARI GRİDİ */}
          {!loading && !error && visibleListings.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-slate-400">{visibleListings.length} ilan listeleniyor</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {visibleListings.map((item) => {
                  const images = listingImages(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group overflow-hidden"
                    >
                      <div className="h-36 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                        {images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-300">
                            <div className="text-3xl">🏭</div>
                            <div className="text-[10px] font-bold mt-1">Görsel eklenmemiş</div>
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-4 flex flex-col justify-between flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-[#1E314A] bg-[#1E314A]/10 px-2 py-0.5 rounded-md border border-[#1E314A]/20">
                              #{item.id}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                              {listingCondition(item)}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1E314A] transition line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1 line-clamp-1">
                              <span>🔩</span> {listingMaterial(item)}
                              {item.category ? ` · ${item.category}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100/80 font-medium">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Durum:</span>
                            <span className="font-bold text-[#1E314A] bg-[#1E314A]/10 px-2 py-0.5 rounded">{item.status || "Aktif"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Kategori:</span>
                            <span className="font-bold text-slate-700">{item.category || "—"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Stok:</span>
                            <span className="font-bold text-slate-900">{listingWeight(item)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Konum:</span>
                            <span className="font-semibold text-slate-700">{listingCity(item)}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Birim Fiyat</span>
                            <span className="text-sm font-black text-slate-900">{listingPrice(item)}</span>
                          </div>

                          <Link
                            href={`/malzemeler/detay?id=${item.id}`}
                            className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            Görüntüle
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* BOŞ SONUÇ */}
          {!loading && !error && visibleListings.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2 w-full">
              <span className="text-3xl">🔍</span>
              <h3 className="font-bold text-slate-800 text-sm">Aradığınız kriterlerde ilan bulunamadı.</h3>
              <p className="text-xs text-slate-400">
                Veritabanında bu filtrelere uyan kayıt yok. Seçimlerinizi değiştirip tekrar deneyin.
              </p>
              <button onClick={handleClearFilters} className="mt-4 text-xs font-bold text-[#1E314A] hover:underline">
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}