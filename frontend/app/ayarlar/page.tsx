"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiUrl } from "@/lib/api";

export default function Ayarlar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"firma" | "profil" | "bildirim" | "fatura">("firma");

  // Firma Formu State'leri
  const [companyData, setCompanyData] = useState({
    companyName: "Döngü Metal San. ve Tic. A.Ş.",
    taxOffice: "Gebze Vergi Dairesi",
    taxNumber: "1234567890",
    phone: "0262 555 01 23",
    email: "kurumsal@dongumetal.com",
    address: "Organize Sanayi Bölgesi, 4. Cadde No:12 Gebze / Kocaeli",
  });

  // Profil & Güvenlik Formu State'leri
  const [profileData, setProfileData] = useState({
    fullName: "Ahmet Yılmaz",
    userEmail: "ahmet.yilmaz@dongumetal.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Bildirim Tercihleri State'leri
  const [notifications, setNotifications] = useState({
    emailOffers: true,
    emailMarket: true,
    smsAlerts: false
  });

  
  useEffect(() => {
    fetch(apiUrl("/api/profile/1"))
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setNotifications({
            emailOffers: data.email_offers === 1 || data.email_offers === true,
            emailMarket: data.email_market === 1 || data.email_market === true,
            smsAlerts: data.sms_alerts === 1 || data.sms_alerts === true
          });
          setCompanyData((prev) => ({
            ...prev,
            companyName: data.company_name || prev.companyName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            taxNumber: data.tax_number || prev.taxNumber,
            taxOffice: data.tax_office || prev.taxOffice,
            address: data.address || prev.address
          }));
          setProfileData((prev) => ({
            ...prev,
            fullName: data.name || prev.fullName,
            userEmail: data.email || prev.userEmail
          }));
        }
      })
      .catch((err) => console.error("Profil yüklenirken hata:", err));
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Ayarlarınız başarıyla güncellendi!");
  };

  
  
  
  const handleDownloadInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Lütfen tarayıcınızdan açılır pencere (pop-up) izni verin.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>DöngüBorsa E-Arşiv Fatura</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 24px; font-weight: 800; color: #1E314A; letter-spacing: -0.5px; }
          .invoice-tag { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 30px 0; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .info-card h4 { margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; }
          .info-card p { margin: 4px 0; font-size: 13px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 12px 14px; text-align: left; font-size: 13px; }
          th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
          .total-box { margin-top: 24px; display: flex; justify-content: flex-end; }
          .total-card { width: 260px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; }
          .total-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
          .grand-total { border-top: 2px solid #0f172a; padding-top: 8px; font-weight: 800; font-size: 16px; color: #0f172a; }
          .status { display: inline-block; padding: 4px 10px; background: #dcfce7; color: #15803d; border-radius: 999px; font-weight: 700; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">♻️ DöngüBorsa</div>
          <div class="invoice-tag">E-ARŞİV FATURA</div>
        </div>
        
        <div class="info-grid">
          <div class="info-card">
            <h4>Alıcı Firma</h4>
            <p>${companyData.companyName || "Döngü Metal San. ve Tic. A.Ş."}</p>
            <p>VKN: ${companyData.taxNumber || "1234567890"}</p>
            <p>VD: ${companyData.taxOffice || "Gebze Vergi Dairesi"}</p>
            <p>${companyData.address || "Organize Sanayi Bölgesi, Gebze / Kocaeli"}</p>
          </div>
          <div class="info-card">
            <h4>Fatura Bilgileri</h4>
            <p>Fatura Tarihi: 01 Mayıs 2026</p>
            <p>Ödeme Durumu: <span class="status">ÖDENDİ</span></p>
            <p>Senaryo: E-Arşiv Ticari</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Hizmet / Açıklama</th>
              <th>Dönem</th>
              <th>Birim Fiyat</th>
              <th>KDV (%20)</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>B2B Kurumsal Kurucu Paket Aboneliği</td>
              <td>1 Ay</td>
              <td>₺ 2.450,00</td>
              <td>₺ 490,00</td>
              <td>₺ 2.940,00</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-card">
            <div class="total-row"><span>Ara Toplam:</span><span>₺ 2.450,00</span></div>
            <div class="total-row"><span>KDV Tutarı:</span><span>₺ 490,00</span></div>
            <div class="total-row grand-total"><span>Genel Toplam:</span><span>₺ 2.940,00</span></div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSaveProfileSecurity = async () => {
    if (profileData.newPassword && profileData.newPassword.length < 6) {
      alert("Yeni şifre en az 6 karakter olmalıdır!");
      return;
    }
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert("Yeni şifreler birbiriyle eşleşmiyor!");
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/profile/1"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.fullName,
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword || undefined
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Profil ve güvenlik bilgileri başarıyla güncellendi!");
        setProfileData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        alert("Hata: " + (result.error || "Güncellenemedi"));
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  
  const handleSaveNotifications = async () => {
    try {
      const res = await fetch(apiUrl("/api/profile/1/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOffers: notifications.emailOffers,
          emailMarket: notifications.emailMarket,
          smsAlerts: notifications.smsAlerts
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Bildirim tercihleri başarıyla kaydedildi!");
      } else {
        alert("Hata: " + (result.error || "Kaydedilemedi"));
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const handleSaveCompany = async () => {
    try {
      const res = await fetch(apiUrl("/api/profile/1"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyData.companyName,
          phone: companyData.phone,
          tax_number: companyData.taxNumber
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Firma bilgileri başarıyla veritabanına kaydedildi!");
      } else {
        alert("Hata: " + (result.error || "Kaydedilemedi"));
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR BİLEŞENİ) */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Ayarlarda ara..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-[#1E314A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              💬
            </button>

            {/* DİNAMİK GİRİŞ / KAYIT VEYA PROFİL */}
            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" 
                      alt="Profil" 
                      className="w-full h-full object-cover" 
                    />
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
                    className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/kayit-ol" 
                    className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ANA AYARLAR İÇERİĞİ */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">Sistem & Hesap Ayarları</h1>
            <p className="text-xs text-slate-400 mt-0.5">Kurumsal firma profilinizi, bildirimlerinizi ve hesap güvenliğinizi yönetin.</p>
          </div>

          {/* SEKME SEÇİMİ (TABS) */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("firma")}
              className={`pb-3 border-b-2 transition shrink-0 ${
                activeTab === "firma"
                  ? "border-[#1E314A] text-[#1E314A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              🏢 Firma Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("profil")}
              className={`pb-3 border-b-2 transition shrink-0 ${
                activeTab === "profil"
                  ? "border-[#1E314A] text-[#1E314A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              👤 Profil & Güvenlik
            </button>
            <button
              onClick={() => setActiveTab("bildirim")}
              className={`pb-3 border-b-2 transition shrink-0 ${
                activeTab === "bildirim"
                  ? "border-[#1E314A] text-[#1E314A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              🔔 Bildirim Tercihleri
            </button>
            <button
              onClick={() => setActiveTab("fatura")}
              className={`pb-3 border-b-2 transition shrink-0 ${
                activeTab === "fatura"
                  ? "border-[#1E314A] text-[#1E314A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              💳 Fatura & Abonelik
            </button>
          </div>

          {/* SEKME 1: FİRMA BİLGİLERİ */}
          {activeTab === "firma" && (
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Kurumsal Profil Detayları</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Firma Resmi Ünvanı</label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Kurumsal E-Posta</label>
                  <input
                    type="email"
                    name="email"
                    value={companyData.email}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Vergi Dairesi</label>
                  <input
                    type="text"
                    name="taxOffice"
                    value={companyData.taxOffice}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Vergi / VK Numarası</label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={companyData.taxNumber}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block font-bold text-slate-700">Telefon Numarası</label>
                  <input
                    type="text"
                    name="phone"
                    value={companyData.phone}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block font-bold text-slate-700">Fatura & Tesis Adresi</label>
                  <textarea
                    name="address"
                    rows={3}
                    value={companyData.address}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={handleSaveCompany} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer">Firma Bilgilerini Kaydet</button>
              </div>
            </form>
          )}

          {/* SEKME 2: PROFİL & GÜVENLİK */}
          {activeTab === "profil" && (
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Kullanıcı Bilgileri & Şifre Değiştir</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Ad Soyad</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Giriş E-Postası</label>
                  <input
                    type="email"
                    name="userEmail"
                    value={profileData.userEmail}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="font-bold text-xs text-slate-800 mb-3">Şifre Güncelleme</h4>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block font-bold text-slate-700">Mevcut Şifre</label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    value={profileData.currentPassword}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Yeni Şifre</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="En az 6 karakter"
                    value={profileData.newPassword}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Yeni şifreyi doğrulayın"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={handleSaveProfileSecurity} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer">Şifre ve Profili Güncelle</button>
              </div>
            </form>
          )}

          {/* SEKME 3: BİLDİRİM TERCİHLERİ */}
          {activeTab === "bildirim" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Bildirim ve Uyarı Kanalları</h3>

              <div className="space-y-4 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Teklif Bildirimleri (E-Posta)</p>
                    <p className="text-slate-400 text-[11px]">İlanlarınıza yeni bir teklif geldiğinde anında e-posta alın.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!notifications.emailOffers} onChange={(e) => setNotifications({ ...notifications, emailOffers: e.target.checked })}
                    className="w-4 h-4 accent-[#1E314A] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Piyasa & Fiyat Trend Haberleri</p>
                    <p className="text-slate-400 text-[11px]">Haftalık ikincil hammadde ve polimer piyasa fiyat uyarıları.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!notifications.emailMarket} onChange={(e) => setNotifications({ ...notifications, emailMarket: e.target.checked })}
                    className="w-4 h-4 accent-[#1E314A] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">SMS / Mobil Doğrulama Uyarısı</p>
                    <p className="text-slate-400 text-[11px]">Önemli güvenlik ve işlem onaylarında SMS ile bilgilendirme.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!notifications.smsAlerts} onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                    className="w-4 h-4 accent-[#1E314A] cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="button" onClick={handleSaveNotifications} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer">Tercihleri Kaydet</button>
              </div>
            </div>
          )}

          {/* SEKME 4: FATURA & ABONELİK */}
          {activeTab === "fatura" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Kurumsal Abonelik Planı</h3>

              <div className="bg-[#1E314A]/10 border border-[#1E314A]/20 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="bg-[#1E314A] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">AKTİF PLAN</span>
                  <h4 className="font-black text-slate-900 text-base mt-1.5">B2B Kurumsal Kurucu Paket</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Sınırsız İlan Verme • Canlı Piyasa Analizleri • 3.1 MTR Sertifika Desteği</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
                  Planı Yükselt
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900">Geçmiş Faturalar</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between p-3.5 bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                    <span>Fatura Tarihi</span>
                    <span>Tutar</span>
                    <span>Durum</span>
                    <span>İndir</span>
                  </div>
                  <div className="flex justify-between p-3.5 border-b border-slate-100">
                    <span>01 Mayıs 2026</span>
                    <span className="font-bold text-slate-800">₺ 2.450 + KDV</span>
                    <span className="text-[#1E314A] font-bold">Ödendi ✓</span>
                    <button type="button" onClick={handleDownloadInvoice} className="text-blue-600 font-bold hover:underline cursor-pointer">PDF</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}