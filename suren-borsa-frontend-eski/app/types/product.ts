// types/product.ts

export interface Product {
  id: string;             // Benzersiz ürün ID'si
  title: string;          // Ürün Başlığı
  category: string;       // Kategori
  weightKg: number;       // Kilo/Miktar (kg cinsinden)
  condition: string;      // Kullanım Durumu (örn: "Stok Fazlası", "İmalat Artığı")
  pricePerTon: number;    // Ton Fiyatı (TL)
  location: {             // Konum Bilgileri
    city: string;         // İl
    district: string;     // İlçe / Sanayi Bölgesi
  };
  certified: boolean;     // Sertifika Durumu (Evet/Hayır)
}