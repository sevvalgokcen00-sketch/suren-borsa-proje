"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function IlanDuzenlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [usageStatus, setUsageStatus] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationDistrict, setLocationDistrict] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/listings/${id}`
        );

        if (!response.ok) {
          throw new Error("İlan getirilemedi");
        }

        const data = await response.json();

        setTitle(data.title || "");
        setWeight(String(data.weight || ""));
        setPrice(String(data.price || ""));
        setUsageStatus(data.usageStatus || "");
        setLocationCity(data.locationCity || "");
        setLocationDistrict(data.locationDistrict || "");
      } catch (error) {
        console.error("İlan yükleme hatası:", error);
      }
    }

    if (id) {
      loadListing();
    }
  }, [id]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/listings/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            weight: Number(weight),
            price: Number(price),
            usageStatus,
            locationCity,
            locationDistrict,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Güncelleme hatası: ${response.status}`);
      }

      alert("İlan başarıyla güncellendi.");
      router.push("/ilanlar-paneli");
    } catch (error) {
      console.error("İlan güncelleme hatası:", error);
      alert("İlan güncellenirken hata oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold mb-6">İlan Düzenle</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Malzeme Adı</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Miktar</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Birim Fiyat</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Durum</label>
            <input
              value={usageStatus}
              onChange={(e) => setUsageStatus(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Şehir</label>
            <input
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">İlçe</label>
            <input
              value={locationDistrict}
              onChange={(e) => setLocationDistrict(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </main>
  );
}