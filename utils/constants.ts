
import { WarningData } from '../types';

// Menggunakan Halaman Peringatan Dini Spesifik Kalbar (HTML)
export const BMKG_ENDPOINT = 'https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca/61';

// Daftar Proxy untuk Redundansi (Failover System)
// Update: Menghapus CorsProxy (403) dan ThingProxy (Error). Memprioritaskan CodeTabs.
export const PROXY_LIST = [
    // 1. CodeTabs - Paling stabil untuk bypass CORS saat ini
    { 
        id: 'CodeTabs',
        url: (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
        isJson: false 
    },
    // 2. AllOrigins (JSON Wrapped) - Fallback stabil
    { 
        id: 'AllOriginsJson',
        url: (target: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`,
        isJson: true 
    },
    // 3. AllOrigins (Raw) - Fallback terakhir
    {
        id: 'AllOriginsRaw',
        url: (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
        isJson: false
    }
];

export const REFRESH_INTERVAL_MS = 60000; // Cek update setiap 1 menit

export const DEFAULT_DATA: WarningData = {
    date: new Date().toLocaleDateString('id-ID'),
    time: "-",
    valid_until: "-",
    summary: "Menghubungkan ke Server BMKG...",
    areas: []
};
