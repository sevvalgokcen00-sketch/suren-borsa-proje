"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function TekliflerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"gelen" | "verilen" | "onaylanan">("gelen");
  const [searchQuery, setSearchQuery] = useState("");

  // CANLI BACKEND BAGLANTISI (api/bids)
  
  const fetchTeklifler = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bids");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((b: any) => ({
          id: b.id,
          listingTitle: b.listingTitle || "Sanayi Malzeme İlanı #" + b.listingId,
          offeredBy: b.buyerCompanyName || "Alıcı #" + b.buyerId,
          offerAmount: b.amount,
          marketMedian: b.price ? b.price * 0.98 : 0,
          totalPrice: b.totalPrice ? b.totalPrice.toLocaleString("tr-TR") + " ₺" : "0 ₺",
          incoterm: b.incoterm || "EXW - Fabrika Teslim",
          paymentType: b.paymentType || "Peşin",
          buyerNote: b.buyerNote || "",
          expiresIn: b.expiresIn || "24s",
          date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("tr-TR") : "Bugün",
          status: (b.status && (b.status.toLowerCase() === "onaylandi" || b.status.toLowerCase() === "onaylandı" || b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "onaylanan")) ? "onaylanan" : (b.status && (b.status.toLowerCase() === "reddedildi" || b.status.toLowerCase() === "rejected")) ? "reddedildi" : "bekleyen",
          hasCertificate: Boolean(b.hasCertificate)
        }));
        setGelenTeklifler(formatted);

        // Sayfa yenilense bile backend'deki onaylı teklifleri tablo 3'e kalıcı aktar
        const approvedFromDb = formatted.filter((item: any) => 
          item.status === "onaylanan" || item.status === "kabul_edildi" || item.status === "approved"
        );
        if (typeof setOnaylananIslemler === "function") {
          setOnaylananIslemler((prev: any[]) => {
            const combined = [...approvedFromDb, ...prev];
            const unique = Array.from(new Map(combined.map((item: any) => [item.id, item])).values());
            return unique;
          });
        }

        const verilenFormatted = data.map((b: any) => ({
          id: b.id,
          listingTitle: b.listingTitle || "Sanayi Malzeme İlanı #" + b.listingId,
          ownerCompany: "Firma 1001 San. Tic. Ltd. Şti.",
          myOffer: b.price || 0,
          amount: b.amount ? b.amount.toString() : "0",
          totalPrice: b.totalPrice ? b.totalPrice.toLocaleString("tr-TR") + " ₺" : (b.price * b.amount).toLocaleString("tr-TR") + " ₺",
          incoterm: b.incoterm || "EXW - Fabrika Teslim",
          paymentType: b.paymentType || "Peşin",
          myNote: b.buyerNote || "Standart teklif iletildi.",
          date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("tr-TR") : "Bugün",
          status: b.status || "bekleyen"
        }));
        setVerilenTeklifler(verilenFormatted.filter((b: any) => b.status !== 'geri_cekildi'));
      }
    } catch (err) {
      console.error("Teklifleri çekme hatası:", err);
    }
  };

  useEffect(() => {
    fetchTeklifler();
  }, []);


  // CANLI TEKLİF DURUM GÜNCELLEME (PATCH /api/bids/:id/status)
  const handleBidStatus = async (bidId: number, newStatus: string) => {
    // Önce ekranda hemen yansıt
    setGelenTeklifler((prev: any[]) =>
      prev.map((item: any) => (item.id === bidId ? { ...item, status: newStatus } : item))
    );
    try {
      const res = await fetch(`http://localhost:5000/api/bids/${bidId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Backend veritabanından kalıcı olarak yeniden yükle
        fetchTeklifler();
      }
    } catch (err) {
      console.error("Status güncelleme hatası:", err);
    }
  };



  // Gelen Teklifler (Demir-Çelik Sektör Terminolojisine Uyarlı)
  const [gelenTeklifler, setGelenTeklifler] = useState([
    {
      id: 101,
      listingTitle: "10mm S235JR Levha Sac Kesim Artığı (12.500 kg)",
      offeredBy: "Firma 1005 San. Tic. Ltd. Şti.",
      offerAmount: 24500,
      marketMedian: 24000,
      totalPrice: "₺ 306.250",
      incoterm: "EXW - Fabrika Teslim",
      paymentType: "Peşin / Banka Havalesi",
      buyerNote: "Nakliye firmamıza aittir. Peşin ödemede tamamını hemen alabiliriz.",
      expiresIn: "14s",
      date: "Bugün, 14:20",
      status: "bekleyen",
      hasCertificate: true,
    },
    {
      id: 102,
      listingTitle: "DKP Soğuk Haddelenmiş Sac Kırpıntısı (4.800 kg)",
      offeredBy: "Firma 1012 San. Tic. Ltd. Şti.",
      offerAmount: 14000,
      marketMedian: 13500,
      totalPrice: "₺ 67.200",
      incoterm: "EXW - Fabrika Teslim",
      paymentType: "30 Gün Vadeli Çek",
      buyerNote: "Kantar teslimatından sonra vade başlar.",
      expiresIn: "2g",
      date: "Dün, 18:45",
      status: "onaylanan",
      hasCertificate: false,
    },
  ]);

  // Verdiğim Teklifler
  const [verilenTeklifler, setVerilenTeklifler] = useState([
    {
      id: 201,
      listingTitle: "İmalat Artığı Profil ve Boru Fireleri (3.200 kg)",
      ownerCompany: "Firma 1008 San. Tic. Ltd. Şti.",
      myOffer: 55000,
      amount: "3200",
      totalPrice: "₺ 176.000",
      incoterm: "EXW - Fabrika Teslim",
      paymentType: "Peşin / Banka Havalesi",
      myNote: "Hemen yükleme yapabiliriz.",
      date: "Bugün, 11:10",
      status: "bekleyen",
    },
  ]);

  // Onaylanan İşlemlerim Listesi State'i
  const [onaylananIslemler, setOnaylananIslemler] = useState([
    {
      id: 301,
      listingTitle: "DKP Soğuk Haddelenmiş Sac Kırpıntısı (4.800 kg)",
      otherParty: "Firma 1012 San. Tic. Ltd. Şti.",
      totalPrice: "₺ 67.200",
      tonnage: "4.8 Ton",
      paymentType: "30 Gün Vadeli Çek",
      incoterm: "EXW - Fabrika Teslim",
      date: "Bugün, Onaylandı",
      savedCarbon: "7.2 Ton CO₂e",
      treeEquivalent: "327 Ağaç"
    }
  ]);

  // MÜZAKERE MODALI STATE'İ
  const [bidModal, setBidModal] = useState<{
    isOpen: boolean;
    mode: "yeni" | "karsi" | "guncelle";
    targetId: number | null;
    title: string;
    company: string;
    price: string;
    amount: string;
    paymentType: "pesin" | "vadeli" | "dbs";
    incoterm: "exw" | "ddp";
    note: string;
  }>({
    isOpen: false,
    mode: "yeni",
    targetId: null,
    title: "10mm S235JR Levha Sac Kesim Artığı",
    company: "Döngü Metal San. A.Ş.",
    price: "24000",
    amount: "12500",
    paymentType: "pesin",
    incoterm: "exw",
    note: "",
  });

  // TİCARİ SÖZLEŞME VE ÖDEME KOORDİNASYON MODALI STATE'İ
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    step: number;
    targetItem: any | null;
  }>({
    isOpen: false,
    step: 1,
    targetItem: null,
  });

  // Not Detay Modalı State'i
  const [activeNoteModal, setActiveNoteModal] = useState<string | null>(null);

  // Malzemeler sayfasından parametreyle gelindiyse otomatik aç
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ilanParam = params.get("ilan");
      const baslikParam = params.get("baslik");
      const fiyatParam = params.get("fiyat");

      if (ilanParam || baslikParam) {
        setBidModal({
          isOpen: true,
          mode: "yeni",
          targetId: null,
          title: baslikParam || `İlan ID: ${ilanParam}`,
          company: "Döngü Metal San. A.Ş.",
          price: fiyatParam || "24500",
          amount: "12500",
          paymentType: "pesin",
          incoterm: "exw",
          note: "",
        });
        window.history.replaceState({}, "", "/teklifler");
      }
    }
  }, []);

  // Finansal Hesaplamalar
  const tonnage = Number(bidModal.amount || 0) / 1000;
  const subtotal = Number(bidModal.price || 0) * tonnage;
  const vatAmount = subtotal * 0.20; 
  const grandTotal = subtotal + vatAmount;

  const formatCurrency = (val: number) =>
    val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const applyDiscount = (pct: number) => {
    const base = 24500;
    const discounted = Math.round(base * (1 - pct / 100));
    setBidModal((prev) => ({ ...prev, price: discounted.toString() }));
  };

  const getSpread = (offer: number, median: number) => {
    const diff = ((offer - median) / median) * 100;
    return diff >= 0 ? `+${diff.toFixed(1)}% Piyasa Üstü` : `${diff.toFixed(1)}% Piyasa Altı`;
  };

  const handleUpdateGelenStatus = async (id: number, newStatus: string) => {
    // Ekranda gecikme olmadan anında göster
    setGelenTeklifler((prev: any[]) =>
      prev.map((item: any) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      // Backend veritabanına kalıcı olarak kaydet
      await fetch(`http://localhost:5000/api/bids/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Teklif durumu backend güncelleme hatası:", err);
    }
  };

  const handleDeleteGelen = async (id: any) => {
    try {
      await fetch(`http://localhost:5000/api/bids/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Teklif silinemedi:", err);
    }
    setGelenTeklifler((prev: any[]) => prev.filter((item: any) => item.id !== id));
  };

  const handleDeleteVerilen = async (id: number) => {
    if (confirm("Bu teklifi geri çekmek istediğinize emin misiniz?")) {
      // Sayfa yenilenmeden anında tüm sekmelerden kaldır
      setVerilenTeklifler((prev: any[]) => prev.filter((item: any) => item.id !== id));
      setGelenTeklifler((prev: any[]) => prev.filter((item: any) => item.id !== id));
      if (typeof setOnaylananIslemler === "function") {
        setOnaylananIslemler((prev: any[]) => prev.filter((item: any) => item.id !== id));
      }
      try {
        await fetch(`http://localhost:5000/api/bids/${id}`, { method: "DELETE" });
        if (typeof fetchTeklifler === "function") {
          fetchTeklifler();
        }
      } catch (err) {
        console.error("Teklif silme hatası:", err);
      }
    }
  };

  const handleSaveBidModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModal.price || !bidModal.amount) {
      alert("Lütfen fiyat ve miktar alanlarını doldurunuz!");
      return;
    }

    const pType = bidModal.paymentType === "pesin" ? "Peşin / Banka Havalesi" : "30 Gün Vadeli Çek";
    const iTerm = (bidModal.incoterm || "EXW").toUpperCase();

    if (bidModal.mode === "guncelle" && bidModal.targetId) {
      try {
        const response = await fetch(`http://localhost:5000/api/bids/${bidModal.targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: Number(bidModal.price),
            amount: Number(bidModal.amount),
            buyerNote: bidModal.note || "",
            paymentType: pType,
            incoterm: iTerm
          })
        });

        if (response.ok) {
          // Tabloda anında görsel güncelleme yap
          setVerilenTeklifler((prev: any[]) =>
            prev.map((item: any) =>
              item.id === bidModal.targetId
                ? {
                    ...item,
                    myOffer: Number(bidModal.price),
                    price: Number(bidModal.price),
                    amount: Number(bidModal.amount),
                    buyerNote: bidModal.note,
                    note: bidModal.note,
                    incoterm: iTerm,
                    paymentType: pType,
                    totalPrice: `${(Number(bidModal.price) * Number(bidModal.amount)).toLocaleString("tr-TR")} ₺`
                  }
                : item
            )
          );
          if (typeof fetchTeklifler === "function") {
            fetchTeklifler();
          }
          setBidModal((prev: any) => ({ ...prev, isOpen: false }));
          alert("Pazarlık teklifiniz başarıyla güncellendi!");
        } else {
          alert("Güncelleme sırasında bir sorun oluştu.");
        }
      } catch (err) {
        console.error("Teklif güncelleme hatası:", err);
      }
      return;
    }

    const calculatedTotal = `₺ ${formatCurrency(subtotal)}`;
    const paymentText =
      bidModal.paymentType === "pesin"
        ? "Peşin / Banka Havalesi"
        : bidModal.paymentType === "vadeli"
        ? "30 Gün Vadeli Çek"
        : "DöngüGüven DBS";
    const incotermText =
      bidModal.incoterm === "exw" ? "EXW - Fabrika Teslim" : "DDP - Adrese Teslim";

    if (bidModal.mode === "yeni") {
    try {
      await fetch("http://localhost:5000/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: 1,
          price: Number(bidModal.price),
          amount: Number(bidModal.amount),
          buyerCompanyName: "Demir Ticaret A.Ş.",
          buyerNote: bidModal.note || "Standart teklif iletildi.",
          status: "bekleyen"
        })
      });
      fetchTeklifler();
    } catch (err) {
      console.error("Teklif kaydedilemedi:", err);
    }

      const newItem = {
        id: Date.now(),
        listingTitle: bidModal.title,
        ownerCompany: bidModal.company || "Firma 1001 San. Tic. Ltd. Şti.",
        myOffer: Number(bidModal.price),
        amount: bidModal.amount,
        totalPrice: calculatedTotal,
        incoterm: incotermText,
        paymentType: paymentText,
        myNote: bidModal.note || "Standart teklif iletildi.",
        date: "Bugün, Şimdi",
        status: "bekleyen",
      };
      setVerilenTeklifler([newItem, ...verilenTeklifler]);
      setActiveTab("verilen");
      alert("✅ Yeni borsa teklifiniz başarıyla iletildi!");
    } else if (bidModal.mode === "karsi" && bidModal.targetId) {
      setGelenTeklifler(
        displayedTeklifler.map((item) =>
          item.id === bidModal.targetId
            ? {
                ...item,
                offerAmount: Number(bidModal.price),
                incoterm: incotermText,
                paymentType: paymentText,
                buyerNote: `[KARŞI TEKLİF]: ${bidModal.note || "Fiyat revize edildi."}`,
                totalPrice: calculatedTotal,
                status: "bekleyen",
              }
            : item
        )
      );
      alert("🔄 Karşı teklifiniz ve pazarlık şartlarınız alıcıya iletildi!");
    } else if (bidModal.mode === "guncelle" && bidModal.targetId) {
      setVerilenTeklifler(
        verilenTeklifler.map((item) =>
          item.id === bidModal.targetId
            ? {
                ...item,
                myOffer: Number(bidModal.price),
                amount: bidModal.amount,
                totalPrice: calculatedTotal,
                incoterm: incotermText,
                paymentType: paymentText,
                myNote: bidModal.note || item.myNote,
              }
            : item
        )
      );
      alert("✅ Verdiğiniz teklif başarıyla güncellendi!");
    }

    setBidModal({ ...bidModal, isOpen: false });
  };

  const filteredGelen = gelenTeklifler.filter(
    (item) =>
      item.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.offeredBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVerilen = verilenTeklifler.filter(
    (item) =>
      item.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ownerCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const displayedTeklifler = activeTab === "onaylanan"
    ? gelenTeklifler.filter(t => t.status === "onaylandi" || t.status === "kabul_edildi")
    : activeTab === "verilen"
    ? verilenTeklifler
    : gelenTeklifler;

  
  // Backend'den onaylanan teklifleri de Onaylanan İşlemlerim sekmesine dahil et
  const backendOnaylananlar = gelenTeklifler
    .filter((item: any) => item.status === "approved" || (String(item.status).toLowerCase().includes("onay")) || ((String(item.status).toLowerCase().includes("onay")) || item.status === "onaylanan"))
    .map((item: any) => ({
      id: item.id,
      listingTitle: item.listingTitle || item.title || "Onaylanan Hammadde",
      otherParty: item.company || item.otherParty || "Alıcı Firma",
      totalPrice: item.price ? `₺ ${(Number(item.price) * (Number(item.amount) || 1)).toLocaleString("tr-TR")}` : "Belirtilmedi",
      tonnage: item.amount ? `${item.amount} ${item.unit || "Ton"}` : "1 Ton",
      paymentType: item.paymentTerm || "Peşin",
      incoterm: item.incoterm || "FOB",
      date: "Bugün, Onaylandı",
      isBackend: true
    }));

  const tumOnaylananlar = gelenTeklifler
    .filter((item: any) => {
      const s = String(item.status || "").toLowerCase();
      return s.includes("onay") || s === "approved";
    })
    .map((item: any) => ({
      id: item.id,
      listingTitle: item.listingTitle || item.title || "Onaylanan Malzeme",
      otherParty: item.company || item.offeredBy || "Alıcı Firma",
      totalPrice: item.totalPrice || (item.price ? ("₺ " + (Number(item.price) * (Number(item.amount) || 1)).toLocaleString("tr-TR")) : "₺ 0"),
      tonnage: item.offerAmount ? (item.offerAmount + " " + (item.unit || "Ton")) : (item.amount ? (item.amount + " Ton") : "1 Ton"),
      paymentType: item.paymentType || "Peşin",
      incoterm: item.incoterm || "EXW - Fabrika Teslim",
      date: "Onaylandı"
    }));

  

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tekliflerde ara (İlan adı veya firma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#123873] focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition font-medium"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔{" "}
              <span className="absolute -top-1 -right-1 bg-[#123873] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#123873] text-white font-bold flex items-center justify-center text-xs">
                    AY
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Ahmet Yılmaz</p>
                    <p className="text-[10px] text-slate-400">Döngü Metal A.Ş.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/giris-yap"
                    style={{ backgroundColor: "#123873" }}
                    className="hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit-ol"
                    style={{ backgroundColor: "#123873" }}
                    className="hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* İÇERİK (ENİNE GENİŞLETİLDİ) */}
        <main className="w-full px-4 md:px-8 py-8 space-y-6 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Teklif ve Müzakere Terminali</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Tüm pazarlıklarınızı, ticari şartlarınızı ve tekliflerinizi tek ekrandan yönetin.
              </p>
            </div>

            <button
              onClick={() =>
                setBidModal({
                  isOpen: true,
                  mode: "yeni",
                  targetId: null,
                  title: "10mm S235JR Levha Sac Kesim Artığı",
                  company: "Firma 1001 San. Tic. Ltd. Şti.",
                  price: "24000",
                  amount: "12500",
                  paymentType: "pesin",
                  incoterm: "exw",
                  note: "",
                })
              }
              style={{ backgroundColor: "#123873" }}
              className="hover:opacity-90 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span> Yeni Teklif Oluştur
            </button>
          </div>

          {/* TAB SEÇİMİ */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6 px-2">
            <button
              onClick={() => setActiveTab("gelen")}
              style={{
                borderColor: activeTab === "gelen" ? "#123873" : "transparent",
                color: activeTab === "gelen" ? "#123873" : "#64748b"
              }}
              className={`pb-3 border-b-2 transition`}
            >
              📥 İlanlarıma Gelen Teklifler ({gelenTeklifler.length})
            </button>
            <button
              onClick={() => setActiveTab("verilen")}
              style={{
                borderColor: activeTab === "verilen" ? "#123873" : "transparent",
                color: activeTab === "verilen" ? "#123873" : "#64748b"
              }}
              className={`pb-3 border-b-2 transition`}
            >
              📤 Verdiğim Teklifler ({verilenTeklifler.length})
            </button>
            <button
              onClick={() => setActiveTab("onaylanan")}
              className={`pb-3 border-b-2 transition ${
                activeTab === "onaylanan"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              🤝 Onaylanan İşlemlerim ({tumOnaylananlar.length})
            </button>
          </div>

          {/* TAB 1: GELEN TEKLİFLER */}
          {activeTab === "gelen" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 w-full">
              <h3 className="font-bold text-sm text-slate-900 px-2">
                İlanlarına Gelen Resmi Teklifler & Ticari Müzakereler
              </h3>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-3">İlan & Alıcı Firma</th>
                      <th className="pb-3 px-3">Birim Fiyat & Piyasa Spread</th>
                      <th className="pb-3 px-3">Teslimat & Ödeme</th>
                      <th className="pb-3 px-3">Pazarlık Notu</th>
                      <th className="pb-3 px-3">Geçerlilik</th>
                      <th className="pb-3 px-3">Durum</th>
                      <th className="pb-3 px-3 text-right">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                {filteredGelen.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-900">{item.listingTitle}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        🏢 {item.offeredBy}
                      </p>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-black text-[#123873] text-sm block">
                        ₺ {item.price ? Number(item.price).toLocaleString("tr-TR") : "0"} / {item.unit || "Ton"}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        -80% Piyasa Altı
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-800 block text-xs">{item.incoterm || "FOB"}</span>
                      <span className="text-[11px] text-slate-500">{item.paymentType || "Peşin"}</span>
                    </td>
                    <td className="py-4 px-3 max-w-xs">
                      {item.buyerNote ? (
                        <button
                          onClick={() => setActiveNoteModal(item.buyerNote)}
                          className="text-left text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] line-clamp-1 transition font-medium"
                        >
                          💬 {item.buyerNote}
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[11px]">- Not Yok -</span>
                      )}
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-slate-600 text-[11px]">
                      ⏱ {item.expiresIn || "24s"}
                    </td>
                    <td className="py-4 px-3 text-center">
                      {item.status === "reddedildi" || item.status === "Reddedildi" ? (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200 inline-flex items-center gap-1">
                          ✕ Reddedildi
                        </span>
                      ) : item.status === "onaylanan" || item.status === "Onaylandı" || item.status === "approved" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 inline-flex items-center gap-1">
                          ✓ Onaylandı
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-200 inline-flex items-center gap-1">
                          ⏳ Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right space-x-1.5">
                      {item.status === "reddedildi" || item.status === "Reddedildi" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteGelen(item.id)}
                          className="text-slate-400 hover:text-red-500 text-xs font-semibold px-2 py-1 rounded transition"
                        >
                          Kaldır
                        </button>
                      ) : item.status === "onaylanan" || item.status === "Onaylandı" || item.status === "approved" ? (
                        <button
                          type="button"
                          onClick={() => setCheckoutModal({ isOpen: true, step: 1, targetItem: item })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm inline-flex items-center gap-1"
                        >
                          Ticari Süreç & Ödeme 🤝
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBidStatus(item.id, "onaylanan")}
                            style={{ backgroundColor: "#123873" }}
                            className="hover:opacity-90 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
                          >
                            Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBidStatus(item.id, "reddedildi")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            </div>
          )}

          
      {/* TAB 2: VERDİĞİM TEKLİFLER */}
      {activeTab === "verilen" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 w-full">
          <div>
            <h3 className="font-bold text-sm text-slate-900 px-2">
              Diğer Malzeme İlanlarına Verdiğiniz Resmi Teklifler
            </h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">İLAN ADI</th>
                  <th className="pb-3 px-3">İLAN SAHİBİ FİRMA</th>
                  <th className="pb-3 px-3">VERDİĞİM TEKLİF</th>
                  <th className="pb-3 px-3">TESLİMAT & TOPLAM</th>
                  <th className="pb-3 px-3">NOTUM</th>
                  <th className="pb-3 px-3">DURUM</th>
                  <th className="pb-3 px-3 text-right">AKSİYONLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVerilen.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-3 font-bold text-slate-900">{item.listingTitle}</td>
                    <td className="py-4 px-3 text-slate-600 font-semibold">🏢 {item.ownerCompany}</td>
                    <td className="py-4 px-3 font-black text-[#123873] text-sm">
                      ₺ {item.myOffer ? Number(item.myOffer).toLocaleString("tr-TR") : (item.price ? Number(item.price).toLocaleString("tr-TR") : "0")} / Ton
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-black text-slate-900 block">{item.totalPrice}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.incoterm || "FOB"}</span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-xs">
                      💬 {item.buyerNote || item.note || "Standart teklif iletildi."}
                    </td>
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 inline-flex items-center gap-1">
                        ✓ Kabul Edildi
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBidModal({
                            isOpen: true,
                            mode: "guncelle",
                            targetId: item.id,
                            title: item.listingTitle || "Malzeme Teklifi",
                            company: item.ownerCompany || "Firma",
                            price: String(item.myOffer || item.price || ""),
                            amount: String(item.amount || item.offerAmount || "1"),
                            paymentType: "pesin",
                            incoterm: "exw",
                            note: item.buyerNote || ""
                          });
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-bold transition"
                      >
                        Güncelle / Pazarlık Yap
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVerilen(item.id)}
                        className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl text-[11px] font-bold transition"
                      >
                        Geri Çek
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVerilen.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Verdiğiniz aktif teklif bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ONAYLANAN İŞLEMLERİM */}
          {activeTab === "onaylanan" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 px-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Tamamlanan ve Mühürlenen Ticari İşlemlerim</h3>
                  <p className="text-xs text-slate-400">Platform üzerinden onayladığınız, ESG raporlarınıza işlenen tescilli hareketler</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  ✓ ISO 14064 Uyumlu
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-3">İlan & Karşı Taraf</th>
                      <th className="pb-3 px-3">Tonaj & Tutar</th>
                      <th className="pb-3 px-3">Ticari Şartlar</th>
                      <th className="pb-3 px-3">Çevresel Kazanım (ESG)</th>
                      <th className="pb-3 px-3 text-right">Sözleşme / Belge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {tumOnaylananlar.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-3">
                          <p className="font-bold text-slate-900">{item.listingTitle}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">🤝 İş Yapılan: {item.otherParty}</p>
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-black text-slate-900 block">{item.totalPrice}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.tonnage}</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-bold text-slate-800 block text-[11px]">{item.incoterm}</span>
                          <span className="text-[10px] text-slate-400">{item.paymentType}</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-bold text-emerald-600 block">🌱 {item.savedCarbon}</span>
                          <span className="text-[10px] text-slate-500">~{item.treeEquivalent}</span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => alert(`"${item.listingTitle}" işlemine ait resmi sözleşme ve ESG sertifikası indiriliyor...`)}
                            style={{ backgroundColor: "#123873" }}
                            className="hover:opacity-90 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
                          >
                            📄 Sözleşme İndir
                          </button>
                        </td>
                      </tr>
                    ))}

                    {onaylananIslemler.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          Henüz onaylanan bir işleminiz bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MÜZAKERE MODALI */}
      {bidModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#123873]/10 text-[#123873] flex items-center justify-center text-lg font-black">
                  🤝
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {bidModal.mode === "yeni" && "Borsa Tahtası: Yeni Resmi Teklif Oluştur"}
                    {bidModal.mode === "karsi" && "Karşı Teklif & Ticari Müzakere Masası"}
                    {bidModal.mode === "guncelle" && "Verdiğin Teklif ve Şartları Güncelle"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bidModal.mode === "karsi" ? `Alıcı Firma: ${bidModal.company}` : "Satıcı Firma: Döngü Metal San. A.Ş."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBidModal({ ...bidModal, isOpen: false })}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300/60 text-slate-600 font-bold text-sm flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBidModal} className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 space-y-6">
                
                <div className="space-y-3">
                  {bidModal.mode === "yeni" ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        İlan Başlığı *
                      </label>
                      <input
                        type="text"
                        required
                        value={bidModal.title}
                        onChange={(e) => setBidModal({ ...bidModal, title: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#123873] focus:bg-white text-slate-900 font-bold text-sm p-3 rounded-xl outline-none transition"
                      />
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">İlan</span>
                      <span className="font-bold text-slate-800 text-sm">{bidModal.title}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Birim Fiyat Teklifiniz (₺ / Ton) *
                    </label>
                    <span className="text-xs font-bold text-slate-400">
                      Referans: 24.500 ₺
                    </span>
                  </div>

                  <input
                    type="number"
                    required
                    value={bidModal.price}
                    onChange={(e) => setBidModal({ ...bidModal, price: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#123873] focus:bg-white text-slate-900 font-black text-2xl p-4 rounded-2xl outline-none transition"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">Hızlı Öner:</span>
                    <button
                      type="button"
                      onClick={() => applyDiscount(2)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#123873] hover:text-white text-slate-700 font-bold text-xs transition"
                    >
                      %-2 (₺24.010)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDiscount(5)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#123873] hover:text-white text-slate-700 font-bold text-xs transition"
                    >
                      %-5 (₺23.275)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDiscount(8)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#123873] hover:text-white text-slate-700 font-bold text-xs transition"
                    >
                      %-8 (₺22.540)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Talep Edilen Miktar (Kilogram) *
                    </label>
                    <span className="text-xs font-bold text-slate-400">
                      Stok: 12.500 kg
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    value={bidModal.amount}
                    onChange={(e) => setBidModal({ ...bidModal, amount: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#123873] focus:bg-white text-slate-900 font-bold text-base p-3.5 rounded-xl outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Ödeme Koşulu Seçimi
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    {[
                      { id: "pesin", title: "Peşin / Havale", desc: "%0 Vade" },
                      { id: "vadeli", title: "30 Gün Vadeli", desc: "Çek / Senet" },
                      { id: "dbs", title: "DöngüGüven DBS", desc: "Teminatlı Havuz" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBidModal({ ...bidModal, paymentType: item.id as any })}
                        style={{
                          borderColor: bidModal.paymentType === item.id ? "#123873" : "#e2e8f0",
                          backgroundColor: bidModal.paymentType === item.id ? "rgba(18, 56, 115, 0.08)" : "transparent",
                          color: bidModal.paymentType === item.id ? "#123873" : "#334155"
                        }}
                        className={`p-3 rounded-xl border text-left transition font-bold`}
                      >
                        <div>{item.title}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Teslimat & Nakliye Şartı
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      { id: "exw", title: "EXW - Fabrika Teslim", desc: "Nakliye alıcıya aittir" },
                      { id: "ddp", title: "DDP - Adrese Teslim", desc: "Nakliye satıcıya aittir" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBidModal({ ...bidModal, incoterm: item.id as any })}
                        style={{
                          borderColor: bidModal.incoterm === item.id ? "#123873" : "#e2e8f0",
                          backgroundColor: bidModal.incoterm === item.id ? "rgba(18, 56, 115, 0.08)" : "transparent",
                          color: bidModal.incoterm === item.id ? "#123873" : "#334155"
                        }}
                        className={`p-3 rounded-xl border text-left transition font-bold`}
                      >
                        <div>{item.title}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Pazarlık Notunuz (Opsiyonel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Örn: Nakliye bize aittir. Peşin ödemede 12.5 tonun tamamını hemen çekebiliriz."
                    value={bidModal.note}
                    onChange={(e) => setBidModal({ ...bidModal, note: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#123873] focus:bg-white text-slate-900 p-3 rounded-xl outline-none resize-none text-xs font-medium"
                  />
                </div>

              </div>

              {/* SAĞ 5 KOLON: SÖZLEŞME ÖZETİ */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#123873] text-white p-6 rounded-2xl shadow-lg space-y-6">
                
                <div className="space-y-5">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      CANLI SÖZLEŞME DÖKÜMÜ
                    </span>
                    <h4 className="text-base font-bold mt-1 text-white">
                      {bidModal.title || "Malzeme İlanı"}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {bidModal.amount || 0} kg ({tonnage.toFixed(2)} Ton) •{" "}
                      {bidModal.incoterm.toUpperCase()} Teslimat
                    </p>
                  </div>

                  <div className="space-y-3 text-xs border-b border-white/10 pb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>Birim Teklif Fiyatı:</span>
                      <span className="font-bold text-white">
                        ₺ {formatCurrency(Number(bidModal.price || 0))} / Ton
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Talep Edilen Tonaj:</span>
                      <span className="font-bold text-white">{tonnage.toFixed(2)} Ton</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ödeme Koşulu:</span>
                      <span className="font-bold text-emerald-400">
                        {bidModal.paymentType === "pesin"
                          ? "Peşin (%0 Vade)"
                          : bidModal.paymentType === "vadeli"
                          ? "30 Gün Vadeli"
                          : "DBS Teminatlı"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Ara Toplam (KDV Hariç):</span>
                      <span className="font-bold text-white">₺ {formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>%20 KDV Tutarı:</span>
                      <span>₺ {formatCurrency(vatAmount)}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-200">GENEL TOPLAM:</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₺ {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>🤝 Resmi Teklifi İlet →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBidModal({ ...bidModal, isOpen: false })}
                    className="w-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold py-3 rounded-xl transition text-xs text-center"
                  >
                    Vazgeç ve Kapat
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-slate-400">
                      🛡️ DöngüBorsa DBS Teminat Protokolü ile Korumalıdır
                    </span>
                  </div>
                </div>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* SÖZLEŞME VE ÖDEME KOORDİNASYON MODALI */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">DöngüBorsa Tescilli İşlem Onay Protokolü</h3>
              </div>
              <button 
                onClick={() => setCheckoutModal({ ...checkoutModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
              <span className={`${checkoutModal.step >= 1 ? "text-[#123873]" : ""}`}>1. Sözleşme</span>
              <span>→</span>
              <span className={`${checkoutModal.step >= 2 ? "text-[#123873]" : ""}`}>2. Ödeme & IBAN</span>
              <span>→</span>
              <span className={`${checkoutModal.step >= 3 ? "text-[#123873]" : ""}`}>3. Onay</span>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              {checkoutModal.step === 1 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900">Endüstriyel Demir-Çelik ve Ham Üretim Artığı Satış Sözleşmesi</h4>
                  <p className="max-h-32 overflow-y-auto text-[11px] text-slate-500 leading-relaxed pr-2">
                    İşbu protokol, DöngüBorsa platformu üzerinden eşleşen taraflar arasında gerçekleşecek olan ikincil hammadde ve üretim artığı transferine ilişkin ticari koşulları kapsar. Satıcı, malzemenin teknik özelliklerini beyan edilen formata uygun teslim etmekle yükümlüdür. Platform doğrudan ödeme havuzu işletmez; ödeme ve lojistik taraflar arasında doğrudan akdedilir.
                  </p>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-slate-800">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#123873] focus:ring-[#123873]" />
                    <span>B2B Satış Şartnamesini ve Sorumluluk Beyanını okudum, onaylıyorum.</span>
                  </label>
                </div>
              )}

              {checkoutModal.step === 2 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900">Doğrudan Ticari Ödeme Bilgileri</h4>
                  <p className="text-[11px] text-slate-500">Taraflar arası mutabakata varılan ödeme yöntemi:</p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-800">Seçilen Yöntem: Kurumsal Havale / EFT</p>
                    <p className="font-mono text-[11px]" style={{ color: "#123873" }}>Alıcı Firma IBAN: TR00 1234 5678 9012 3456 7890 12</p>
                    <p className="text-[10px] text-slate-400">Açıklama kısmına "DöngüBorsa İşlem No" yazılması zorunludur.</p>
                  </div>
                </div>
              )}

              {checkoutModal.step === 3 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900">Lojistik ve Sevkiyat Koordinasyonu</h4>
                  <p className="text-[11px] text-slate-500">Malzemenin çıkış adresi ve tahmini sevk tarihi:</p>
                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Teslim Alınacak Organize Sanayi / Tesis:</label>
                      <input type="text" defaultValue="Sakarya 1. OSB, Çelik Cad. No:14" className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Planlanan Sevkiyat Tarihi:</label>
                      <input type="date" defaultValue="2026-09-05" className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {checkoutModal.step === 4 && (
                <div className="space-y-6 text-center py-2">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner border border-emerald-100">
                    ✓
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-base">
                      Ticari İşlem Başarıyla Onaylandı!
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      İşlem verileri gösterge paneline işlendi ve dönüştürülen tonaj kümülatif verilere eklendi.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800/60 relative overflow-hidden text-left space-y-3">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌱</span>
                      <h5 className="font-black text-emerald-400 text-xs tracking-wide">
                        Tebrikler, Doğayı Korudunuz!
                      </h5>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Bu onaylanan işlemle birlikte sıfırdan üretim yapılması engellenmiş ve doğaya salınacak karbon emisyonunun önüne geçilmiştir.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Önlenen Karbon</span>
                        <span className="text-xs font-black text-emerald-400">~1.49 Ton CO₂e</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ağaç Eşdeğeri</span>
                        <span className="text-xs font-black text-emerald-400">~68 Yetişkin Ağaç</span>
                      </div>
                    </div>

                    <div className="pt-1 text-[9px] text-emerald-500/90 font-mono text-center">
                      ✓ ISO 14064 Kapsam 3 Raporunuza Otomatik İşlendi
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {checkoutModal.step > 1 && checkoutModal.step < 4 ? (
                <button 
                  onClick={() => setCheckoutModal({ ...checkoutModal, step: checkoutModal.step - 1 })}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  Geri
                </button>
              ) : <div />}

              {checkoutModal.step < 3 ? (
                <button 
                  onClick={() => setCheckoutModal({ ...checkoutModal, step: checkoutModal.step + 1 })}
                  style={{ backgroundColor: "#123873" }}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:opacity-90 transition"
                >
                  İlerle →
                </button>
              ) : checkoutModal.step === 3 ? (
            <button
              onClick={async () => {
                const target = checkoutModal.targetItem;
                if (target?.id) {
                  await handleBidStatus(target.id, "onaylanan");
                }
                setCheckoutModal({ ...checkoutModal, step: 4 });
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 transition"
            >
              İşlemi Onayla 🤝
            </button>
              ) : (
                <button 
                  onClick={() => {
                    setCheckoutModal({ isOpen: false, step: 1, targetItem: null });
                    setActiveTab("onaylanan");
                  }}
                  style={{ backgroundColor: "#123873" }}
                  className="w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition"
                >
                  Onaylanan İşlemlerime Git ↗
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* NOT OKUMA MODALI */}
      {activeNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">💬 Pazarlık ve Müzakere Notu</h3>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
              "{activeNoteModal}"
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveNoteModal(null)}
                style={{ backgroundColor: "#123873" }}
                className="text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}