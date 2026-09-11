/**
 * Merkezi API yardımcısı.
 *
 * ÖNEMLİ — NEXT_PUBLIC_ değişkenleri BUILD ZAMANINDA gömülür, çalışma anında
 * okunmaz. Vercel'de NEXT_PUBLIC_API_URL değiştirilirse yeniden deploy gerekir.
 * Bu yüzden burada değerin sonradan değişebileceğini varsayan hiçbir mantık yok:
 * modül yüklenirken bir kez çözülür.
 *
 * Bu dosyaya ASLA gizli değer koymayın (Turso token'ı, JWT secret vb.).
 * NEXT_PUBLIC_ önekli her şey tarayıcı paketine girer ve siteyi açan herkes okur.
 * Frontend'in bunların hiçbirine ihtiyacı yok.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Taban URL ile yolu birleştirir. Yolun başında "/" olsa da olmasa da çalışır.
 *   apiUrl("/api/listings")          -> "<base>/api/listings"
 *   apiUrl("api/listings")           -> "<base>/api/listings"
 *   apiUrl("/uploads/MD-TEMIZ-01.jpg") -> "<base>/uploads/MD-TEMIZ-01.jpg"
 */
export function apiUrl(path: string): string {
  if (!path) return API_BASE;

  // Zaten mutlak URL ise olduğu gibi bırak
  if (/^https?:\/\//i.test(path)) return path;

  const base = API_BASE.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * JWT'yi localStorage'dan okur ve Authorization başlığı döndürür.
 * Sunucu tarafında (window undefined) güvenle boş nesne döner.
 *
 * Bugün hiçbir istek bu başlığı göndermiyor; backend'e kimlik doğrulama
 * eklendiğinde her çağrı noktasında tek satırlık değişiklik yeterli olsun diye
 * şimdiden hazır duruyor:
 *   headers: { "Content-Type": "application/json", ...authHeaders() }
 */
export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const token = window.localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    // Gizli sekme / site verisi engellenmiş olabilir
    return {};
  }
}

/**
 * fetch sarmalayıcısı: JSON içerik tipi ayarlar, yanıt ok değilse
 * durum kodu ve gövde metnini içeren bir hata fırlatır.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* gövde okunamadıysa boş bırak */
    }
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Backend'den gelen kayıtlardaki görsel yollarını tam URL'e çevirir.
 *
 * API, "/uploads/MD-TEMIZ-01.jpg" gibi kök-göreli yollar döndürür. Bunlar
 * BACKEND kaynağına görelidir; olduğu gibi render edilirse tarayıcı Vercel
 * alan adından ister ve 404 alır.
 */
export function imageUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "";
  return apiUrl(pathOrUrl);
}

/**
 * imageUrls alanı API'de JSON dizi METNİ ya da gerçek dizi olarak gelebilir.
 * Her iki biçimi de tam URL dizisine çevirir.
 */
export function imageUrlList(value?: string | string[] | null): string[] {
  if (!value) return [];

  let list: unknown = value;
  if (typeof value === "string") {
    try {
      list = JSON.parse(value);
    } catch {
      return [apiUrl(value)];
    }
  }

  if (!Array.isArray(list)) return [];
  return list
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .map((p) => apiUrl(p));
}
