"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function TekliflerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"gelen" | "verilen" | "onaylanan">("gelen");
  const [searchQuery, setSearchQuery] = useState("");

  // Gelen Teklifler
  const [gelenTeklifler, setGelenTeklifler] = useState([
    {
      id: 101,
      listingTitle: "10mm S235JR Levha Sac (12.500 kg)",
      offeredBy: "AluTek Alüminyum A.Ş.",
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
      listingTitle: "Granül PP Plastik Çapak (4.800 kg)",
      offeredBy: "EcoKağıt Geri Dönüşüm A.Ş.",
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
      listingTitle: "Alüminyum Profil Fire (3.200 kg)",
      ownerCompany: "AluTek A.Ş.",
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

  // YENİ: Onaylanan İşlemlerim Listesi State'i
  const [onaylananIslemler, setOnaylananIslemler] = useState([
    {
      id: 301,
      listingTitle: "Granül PP Plastik Çapak (4.800 kg)",
      otherParty: "EcoKağıt Geri Dönüşüm A.Ş.",
      totalPrice: "₺ 67.200",
      tonnage: "4.8 Ton",
      paymentType: "30 Gün Vadeli Çek",
      incoterm: "EXW - Fabrika Teslim",
      date: "Bugün, Onaylandı",
      savedCarbon: "7.2 Ton CO₂e",
      treeEquivalent: "327 Ağaç"
    }
  ]);

  // YENİ NESİL GENİŞ MÜZAKERE MODALI STATE'İ
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

  // GÜVENLİ TİCARİ SÖZLEŞME VE ÖDEME KOORDİNASYON MODALI STATE'İ
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

  // Finansal Hesaplamalar (2 Basamaklı Net Kuruş)
  const tonnage = Number(bidModal.amount || 0) / 1000;
  const subtotal = Number(bidModal.price || 0) * tonnage;
  const vatAmount = subtotal * 0.20; // %20 KDV
  const grandTotal = subtotal + vatAmount;

  const formatCurrency = (val: number) =>
    val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Hızlı indirim butonları
  const applyDiscount = (pct: number) => {
    const base = 24500;
    const discounted = Math.round(base * (1 - pct / 100));
    setBidModal((prev) => ({ ...prev, price: discounted.toString() }));
  };

  const getSpread = (offer: number, median: number) => {
    const diff = ((offer - median) / median) * 100;
    return diff >= 0 ? `+${diff.toFixed(1)}% Piyasa Üstü` : `${diff.toFixed(1)}% Piyasa Altı`;
  };

  const handleUpdateGelenStatus = (id: number, newStatus: string) => {
    setGelenTeklifler(
      gelenTeklifler.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleDeleteGelen = (id: number) => {
    if (confirm("Bu teklifi silmek istediğinize emin misiniz?")) {
      setGelenTeklifler(gelenTeklifler.filter((item) => item.id !== id));
    }
  };

  const handleDeleteVerilen = (id: number) => {
    if (confirm("Bu teklifi geri çekmek istediğinize emin misiniz?")) {
      setVerilenTeklifler(verilenTeklifler.filter((item) => item.id !== id));
    }
  };

  // FORMU KAYDETME
  const handleSaveBidModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModal.title || !bidModal.price || !bidModal.amount) {
      alert("Lütfen zorunlu alanları doldurun!");
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
      const newItem = {
        id: Date.now(),
        listingTitle: bidModal.title,
        ownerCompany: bidModal.company || "Belirtilmemiş Firma",
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
        gelenTeklifler.map((item) =>
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
                    className="bg-[#123873] hover:bg-[#0d2a56] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit-ol"
                    className="bg-[#123873] hover:bg-[#0d2a56] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* İÇERİK */}
        <main className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                  company: "Döngü Metal San. A.Ş.",
                  price: "24000",
                  amount: "12500",
                  paymentType: "pesin",
                  incoterm: "exw",
                  note: "",
                })
              }
              className="bg-[#123873] hover:bg-[#0d2a56] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span> Yeni Teklif Oluştur
            </button>
          </div>

          {/* TAB SEÇİMİ (3. Onaylanan Sekmesi Eklendi) */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
            <button
              onClick={() => setActiveTab("gelen")}
              className={`pb-3 border-b-2 transition ${
                activeTab === "gelen"
                  ? "border-[#123873] text-[#123873]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📥 İlanlarıma Gelen Teklifler ({gelenTeklifler.length})
            </button>
            <button
              onClick={() => setActiveTab("verilen")}
              className={`pb-3 border-b-2 transition ${
                activeTab === "verilen"
                  ? "border-[#123873] text-[#123873]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
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
              🤝 Onaylanan İşlemlerim ({onaylananIslemler.length})
            </button>
          </div>

          {/* TAB 1: GELEN TEKLİFLER */}
          {activeTab === "gelen" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                İlanlarına Gelen Resmi Teklifler & Ticari Müzakereler
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">İlan & Alıcı Firma</th>
                      <th className="pb-3">Birim Fiyat & Piyasa Spread</th>
                      <th className="pb-3">Teslimat & Ödeme</th>
                      <th className="pb-3">Pazarlık Notu</th>
                      <th className="pb-3">Geçerlilik</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3 text-right">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredGelen.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4">
                          <p className="font-bold text-slate-900">{item.listingTitle}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            🏢 {item.offeredBy}
                          </p>
                        </td>

                        <td className="py-4">
                          <p className="font-black text-[#123873] text-sm">
                            ₺ {item.offerAmount.toLocaleString("tr-TR")} / Ton
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                              item.offerAmount >= item.marketMedian
                                ? "text-emerald-700 bg-emerald-50"
                                : "text-amber-700 bg-amber-50"
                            }`}
                          >
                            {getSpread(item.offerAmount, item.marketMedian)}
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="font-bold text-slate-800 block text-[11px]">
                            {item.incoterm}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.paymentType}</span>
                        </td>

                        <td className="py-4 max-w-xs">
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

                        <td className="py-4 font-mono font-bold text-slate-600 text-[11px]">
                          ⏱️ {item.expiresIn}
                        </td>

                        <td className="py-4">
                          {item.status === "bekleyen" && (
                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ⏳ Bekliyor
                            </span>
                          )}
                          {item.status === "onaylanan" && (
                            <span className="bg-[#123873]/10 text-[#123873] px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✓ Onaylandı
                            </span>
                          )}
                          {item.status === "reddedilen" && (
                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✕ Reddedildi
                            </span>
                          )}
                        </td>

                        <td className="py-4 text-right space-x-1.5">
                          {item.status === "bekleyen" ? (
                            <>
                              <button
                                onClick={() => handleUpdateGelenStatus(item.id, "onaylanan")}
                                className="bg-[#123873] hover:bg-[#0d2a56] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() =>
                                  setBidModal({
                                    isOpen: true,
                                    mode: "karsi",
                                    targetId: item.id,
                                    title: item.listingTitle,
                                    company: item.offeredBy,
                                    price: item.offerAmount.toString(),
                                    amount: "12500",
                                    paymentType: "pesin",
                                    incoterm: "exw",
                                    note: "",
                                  })
                                }
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-bold transition"
                              >
                                Karşı Teklif
                              </button>
                            </>
                          ) : item.status === "onaylanan" ? (
                            <button
                              onClick={() => setCheckoutModal({ isOpen: true, step: 1, targetItem: item })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
                            >
                              Ticari Süreç & Ödeme 🤝
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteGelen(item.id)}
                              className="text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition text-[11px] font-bold"
                            >
                              Sil
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredGelen.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Hiç gelen teklif bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VERDİĞİM TEKLİFLER */}
          {activeTab === "verilen" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Diğer Malzeme İlanlarına Verdiğiniz Resmi Teklifler
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">İlan Adı</th>
                      <th className="pb-3">İlan Sahibi Firma</th>
                      <th className="pb-3">Verdiğim Teklif</th>
                      <th className="pb-3">Teslimat & Toplam</th>
                      <th className="pb-3">Notum</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3 text-right">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredVerilen.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 font-bold text-slate-900">{item.listingTitle}</td>
                        <td className="py-4 text-slate-600 font-semibold">🏢 {item.ownerCompany}</td>
                        <td className="py-4 font-black text-[#123873] text-sm">
                          ₺ {item.myOffer.toLocaleString("tr-TR")} / Ton
                        </td>
                        <td className="py-4">
                          <span className="font-black text-slate-900 block">{item.totalPrice}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {item.incoterm}
                          </span>
                        </td>
                        <td className="py-4 max-w-xs">
                          <button
                            onClick={() => setActiveNoteModal(item.myNote)}
                            className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-[11px] block line-clamp-1 transition"
                          >
                            💬 {item.myNote}
                          </button>
                        </td>
                        <td className="py-4">
                          {item.status === "bekleyen" && (
                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ⏳ Yanıt Bekleniyor
                            </span>
                          )}
                          {item.status === "onaylanan" && (
                            <span className="bg-[#123873]/10 text-[#123873] px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✓ Kabul Edildi
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              setBidModal({
                                isOpen: true,
                                mode: "guncelle",
                                targetId: item.id,
                                title: item.listingTitle,
                                company: item.ownerCompany,
                                price: item.myOffer.toString(),
                                amount: item.amount || "10000",
                                paymentType: "pesin",
                                incoterm: "exw",
                                note: item.myNote,
                              })
                            }
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-bold transition"
                          >
                            Güncelle / Pazarlık Yap
                          </button>
                          <button
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

          {/* TAB 3: ONAYLANAN İŞLEMLERİM (YENİ EKLENEN SEKME) */}
          {activeTab === "onaylanan" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Tamamlanan ve Mühürlenen Ticari İşlemlerim</h3>
                  <p className="text-xs text-slate-400">Platform üzerinden onayladığınız, ESG raporlarınıza işlenen tescilli hareketler</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  ✓ ISO 14064 Uyumlu
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold pb-3 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">İlan & Karşı Taraf</th>
                      <th className="pb-3">Tonaj & Tutar</th>
                      <th className="pb-3">Ticari Şartlar</th>
                      <th className="pb-3">Çevresel Kazanım (ESG)</th>
                      <th className="pb-3 text-right">Sözleşme / Belge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {onaylananIslemler.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4">
                          <p className="font-bold text-slate-900">{item.listingTitle}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">🤝 İş Yapılan: {item.otherParty}</p>
                        </td>
                        <td className="py-4">
                          <span className="font-black text-slate-900 block">{item.totalPrice}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.tonnage}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-slate-800 block text-[11px]">{item.incoterm}</span>
                          <span className="text-[10px] text-slate-400">{item.paymentType}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-emerald-600 block">🌱 {item.savedCarbon}</span>
                          <span className="text-[10px] text-slate-500">~{item.treeEquivalent}</span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => alert(`"${item.listingTitle}" işlemine ait resmi sözleşme ve ESG sertifikası indiriliyor...`)}
                            className="bg-[#123873] hover:bg-[#0d2a56] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm"
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

      {/* YENİ NESİL FINTECH / BORSA MÜZAKERE MODALI */}
      {bidModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* MODAL HEADER */}
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

              {/* ÇARPI BUTONU */}
              <button
                onClick={() => setBidModal({ ...bidModal, isOpen: false })}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300/60 text-slate-600 font-bold text-sm flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY: 2 KOLONLU FINTECH GRID */}
            <form onSubmit={handleSaveBidModal} className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SOL 7 KOLON: İNTERAKTİF KARTLAR VE GİRDİLER */}
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
                        className={`p-3 rounded-xl border text-left transition ${
                          bidModal.paymentType === item.id
                            ? "border-[#123873] bg-[#123873]/10 text-[#123873] font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="font-bold">{item.title}</div>
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
                        className={`p-3 rounded-xl border text-left transition ${
                          bidModal.incoterm === item.id
                            ? "border-[#123873] bg-[#123873]/10 text-[#123873] font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="font-bold">{item.title}</div>
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

              {/* SAĞ 5 KOLON: LACİVERT TEMA SÖZLEŞME ÖZETİ VE VAZGEÇ */}
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

      {/* GÜVENLİ TİCARİ SÖZLEŞME VE ÖDEME / KOORDİNASYON MODALI */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
            
            {/* Üst Başlık */}
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

            {/* Adım Göstergesi (Stepper) - 3. Adım "Onay" Olarak Güncellendi */}
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
              <span className={`${checkoutModal.step >= 1 ? "text-[#123873]" : ""}`}>1. Sözleşme</span>
              <span>→</span>
              <span className={`${checkoutModal.step >= 2 ? "text-[#123873]" : ""}`}>2. Ödeme & IBAN</span>
              <span>→</span>
              <span className={`${checkoutModal.step >= 3 ? "text-[#123873]" : ""}`}>3. Onay</span>
            </div>

            {/* İÇERİK - ADIMLAR */}
            <div className="space-y-4 text-xs text-slate-600">
              {checkoutModal.step === 1 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900">Endüstriyel Malzeme Satış ve Devir Sözleşmesi</h4>
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
                    <p className="font-mono text-[11px] text-[#123873]">Alıcı Firma IBAN: TR00 1234 5678 9012 3456 7890 12</p>
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
                  
                  {/* Başarı İkonu */}
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner border border-emerald-100">
                    ✓
                  </div>

                  {/* Başlık ve Açıklama */}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-base">
                      Ticari İşlem Başarıyla Onaylandı!
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      İşlem verileri gösterge paneline işlendi ve dönüştürülen tonaj kümülatif verilere eklendi.
                    </p>
                  </div>

                  {/* ÇEVRESEL TEBRİK KARTI */}
                  <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800/60 relative overflow-hidden text-left space-y-3">
                    
                    {/* Dekoratif Işık Efekti */}
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

                    {/* Kazanım Özet Kutuları */}
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

            {/* Alt Butonlar */}
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
                  onClick={() => {
                    // YENİ: Onaylandığı an Onaylanan İşlemlerim listesine ekle
                    const yeniIslem = {
                      id: Date.now(),
                      listingTitle: checkoutModal.targetItem?.listingTitle || "Endüstriyel Demir-Çelik Levha",
                      otherParty: checkoutModal.targetItem?.offeredBy || "Döngü Metal A.Ş.",
                      totalPrice: checkoutModal.targetItem?.totalPrice || "₺ 125.000",
                      tonnage: "10.0 Ton",
                      paymentType: "Kurumsal Havale / EFT",
                      incoterm: "EXW - Fabrika Teslim",
                      date: "Az önce",
                      savedCarbon: "15.0 Ton CO₂e",
                      treeEquivalent: "680 Ağaç"
                    };
                    setOnaylananIslemler([yeniIslem, ...onaylananIslemler]);
                    setCheckoutModal({ ...checkoutModal, step: 4 });
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 transition"
                >
                  İşlemi Onayla ✓
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setCheckoutModal({ isOpen: false, step: 1, targetItem: null });
                    setActiveTab("onaylanan"); // Kullanıcı kapatınca direkt onaylananlar sekmesine yönlendirilsin
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
                className="bg-[#123873] text-white font-bold px-5 py-2 rounded-xl text-xs"
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