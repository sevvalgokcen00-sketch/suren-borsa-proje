import { imageUrlList } from "./api";

/**
 * GET /api/listings ve GET /api/listings/:id yanıt şekli.
 * Alan adları CANLI API'den okunarak yazıldı (mock nesnelerden değil).
 *
 * ŞEMA YARASI: aynı kavram için hem snake_case hem camelCase kolon var
 * (material_type/materialType, city/locationCity, image_url/imageUrl/imageUrls).
 * Uygulama üzerinden oluşturulan kayıtlarda ikisinden yalnızca biri dolu:
 *   - POST /api/listings  ->  city DOLU, locationCity NULL
 *   - seed kayıtları      ->  ikisi de dolu
 * Bu yüzden hiçbir alana doğrudan erişmeyin; aşağıdaki yardımcıları kullanın.
 */
export type Listing = {
  id: number;
  user_id: number | null;
  categoryId: number | null;
  title: string;
  description: string | null;
  material_type: string | null;
  materialType: string | null;
  category: string | null;
  usageStatus: string | null;
  weight: number | null;
  unit: string | null;
  price: number | null;
  city: string | null;
  locationCity: string | null;
  locationDistrict: string | null;
  image_url: string | null;
  imageUrl: string | null;
  /** API bunu ZATEN dizi olarak parse edip döndürüyor; yine de metin gelebilir. */
  imageUrls: string[] | string | null;
  status: string | null;
  is_archived: number | null;
  created_at: string | null;
};

export const BELIRTILMEMIS = "Belirtilmemiş";

/** Malzeme türü: materialType veya material_type (hangisi doluysa). */
export function listingMaterial(l: Listing): string {
  return l.materialType || l.material_type || BELIRTILMEMIS;
}

/** Konum: city veya locationCity (uygulamadan oluşan kayıtlarda locationCity NULL). */
export function listingCity(l: Listing): string {
  return l.city || l.locationCity || BELIRTILMEMIS;
}

/** Kondisyon: yalnızca usageStatus var, yeni kayıtlarda NULL. */
export function listingCondition(l: Listing): string {
  return l.usageStatus || BELIRTILMEMIS;
}

/**
 * Görseller. imageUrls backend'e göreli yollar içerir ("/uploads/x.jpg"),
 * imageUrlList() bunları Cloud Run kaynağına çözer. Tekil image_url/imageUrl
 * alanları da yedek olarak değerlendirilir. Hiçbiri yoksa boş dizi döner ve
 * çağıran taraf yer tutucu göstermelidir.
 */
export function listingImages(l: Listing): string[] {
  const many = imageUrlList(l.imageUrls);
  if (many.length > 0) return many;

  const single = l.imageUrls && typeof l.imageUrls === "string" ? null : l.image_url || l.imageUrl;
  return single ? imageUrlList([single]) : [];
}

/** Ağırlık gösterimi: "12.700 kg" */
export function listingWeight(l: Listing): string {
  if (l.weight === null || l.weight === undefined) return BELIRTILMEMIS;
  return `${Number(l.weight).toLocaleString("tr-TR")} ${l.unit || "kg"}`;
}

/** Birim fiyat gösterimi: "₺ 13,70/kg" */
export function listingPrice(l: Listing): string {
  if (l.price === null || l.price === undefined) return BELIRTILMEMIS;
  return `₺ ${Number(l.price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${l.unit || "kg"}`;
}

/** GET /api/market/indexes */
export type MarketIndex = {
  id: number;
  materialType: string;
  referencePrice: number;
  basePrice: number | null;
  trend: string | null;
  dailyChangePercent: number;
  minPrice: number;
  maxPrice: number;
  transactionCount: number;
  trustLevel: string | null;
  updatedAt: string | null;
};

/** GET /api/market/history/:materialType */
export type MarketHistoryPoint = {
  id: number;
  materialType: string;
  price: number;
  recordedDate: string | null;
  date: string | null;
};

/** GET /api/dashboard -> data */
export type DashboardData = {
  kpi: {
    totalVolume: { raw: number; value: string };
    recycledAmount: { raw: number; value: string };
    activeListings: { raw: number; value: string; addedToday: number; note: string };
    incomingOffers: { raw: number; value: string; note: string };
  };
  stats: { totalListings: number; addedToday: number; pendingOffers: number };
  trendChart: { month: string | null; volume: number }[];
};

/** GET /api/company-analysis -> data */
export type CompanyAnalysisData = {
  kpi: {
    totalCompanies: { raw: number; value: string };
    activeListings: { raw: number; value: string };
    totalVolume: { raw: number; value: string };
    recycledMaterial: { raw: number; value: string };
  };
  companies: {
    id: number;
    name: string;
    mainMaterial: string;
    avgVolume: string;
    totalTransactions: number;
    totalVolumeNum: number;
  }[];
  featuredCompany: {
    name: string;
    verified: boolean;
    description: string;
    mainMaterial: string;
    totalVolume: string;
    totalTransactions: number;
  };
  charts: {
    companyVolume: { company: string; volume: number }[];
    materialDistribution: {
      totalWeight: string;
      items: { name: string; percentage: number; color: string }[];
    };
  };
};
