"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MalzemeDetayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [listing, setListing] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/listings/${id}`
        );

        if (!response.ok) {
          throw new Error("İlan alınamadı");
        }

        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("İlan yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadListing();
    }
  }, [id]);

  const handleOffer = async () => {
    try {
      if (!companyName || !offerPrice) {
        alert("Firma adı ve teklif fiyatı zorunludur.");
        return;
      }

      const response = await fetch("http://localhost:5001/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: Number(id),
          companyName,
          offerPrice: Number(offerPrice),
          note,
        }),
      });

      if (!response.ok) {
        throw new Error(`Teklif gönderilemedi: ${response.status}`);
      }

      const data = await response.json();

      console.log("Teklif oluşturuldu:", data);

      alert("Teklifiniz başarıyla gönderildi!");

      router.push("/teklifler");
    } catch (error) {
      console.error("Teklif gönderme hatası:", error);
      alert("Teklif gönderilirken hata oluştu.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        İlan yükleniyor...
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        İlan bulunamadı.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <button
            onClick={() => router.push("/malzemeler")}
            className="text-sm font-semibold text-emerald-600 mb-4"
          >
            ← Malzemelere Dön
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            {listing.title}
          </h1>

          <p className="text-slate-500 mt-2">
            {listing.description || "Açıklama bulunmuyor."}
          </p>

          <div className="mt-5 space-y-2 bg-slate-50 p-4 rounded-xl">
            <p>
              <strong>Miktar:</strong> {listing.weight} {listing.unit}
            </p>

            <p>
              <strong>Birim Fiyat:</strong> {listing.price} TL
            </p>

            <p>
              <strong>Durum:</strong> {listing.usageStatus}
            </p>

            <p>
              <strong>Konum:</strong> {listing.locationCity}
              {listing.locationDistrict
                ? ` / ${listing.locationDistrict}`
                : ""}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Teklif Ver
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">
                Firma Adı
              </label>

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Örn: Test Metal A.Ş."
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Teklif Fiyatı (TL/kg)
              </label>

              <input
                type="number"
                step="0.01"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Not
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2"
                rows={4}
                placeholder="Teklifinizle ilgili not..."
              />
            </div>

            <button
              type="button"
              onClick={handleOffer}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl"
            >
              Teklifi Gönder
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}