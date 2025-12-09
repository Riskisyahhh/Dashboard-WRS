
// Mapping for West Kalimantan Regencies Center Points [Lat, Lng]
export const KABUPATEN_COORDS: Record<string, [number, number]> = {
    "pontianak": [-0.02, 109.34],
    "kota pontianak": [-0.02, 109.34],
    "sintang": [0.07, 111.49],
    "kabupaten sintang": [0.07, 111.49],
    "sekadau": [0.03, 110.95],
    "kabupaten sekadau": [0.03, 110.95],
    "melawi": [-0.34, 111.69],
    "kabupaten melawi": [-0.34, 111.69],
    "kapuas hulu": [0.82, 112.93],
    "kabupaten kapuas hulu": [0.82, 112.93],
    "ketapang": [-1.85, 110.47],
    "kabupaten ketapang": [-1.85, 110.47],
    "sambas": [1.34, 109.29],
    "kabupaten sambas": [1.34, 109.29],
    "singkawang": [0.90, 108.99],
    "kota singkawang": [0.90, 108.99],
    "bengkayang": [0.82, 109.65],
    "kabupaten bengkayang": [0.82, 109.65],
    "mempawah": [0.36, 109.17],
    "kabupaten mempawah": [0.36, 109.17],
    "sanggau": [0.12, 110.59],
    "kabupaten sanggau": [0.12, 110.59],
    "landak": [0.45, 109.96],
    "kabupaten landak": [0.45, 109.96],
    "kubu raya": [-0.45, 109.52],
    "kabupaten kubu raya": [-0.45, 109.52],
    "kayong utara": [-1.13, 109.96],
    "kabupaten kayong utara": [-1.13, 109.96]
};

export const getCoords = (name: string): [number, number] => {
    const key = name.toLowerCase();
    return KABUPATEN_COORDS[key] || [-0.02, 109.34]; // Default Pontianak
};
