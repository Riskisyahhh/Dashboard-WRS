
// Helper untuk format jam HH:mm
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
};

export const getMockWarningData = () => {
    const now = new Date();
    
    // LOGIKA PEMBULATAN WAKTU (REALISTIC REPORT TIMING)
    // Laporan BMKG biasanya rilis per 30 menit atau 1 jam, bukan setiap detik.
    // Kita bulatkan waktu 'start' ke kelipatan 30 menit terakhir.
    const minutes = now.getMinutes();
    const remainder = minutes % 30; 
    
    // Waktu mulai = Waktu sekarang dikurangi sisa menit agar pas di :00 atau :30
    // Contoh: 16:42 -> 16:30. 17:15 -> 17:00.
    const startTimestamp = now.getTime() - (remainder * 60000);
    const start = new Date(startTimestamp);
    
    // Durasi standar peringatan dini adalah 2-3 jam
    const end = new Date(start.getTime() + 180 * 60000); // +3 Jam

    return {
        "peringatan": {
            "jam_mulai": formatTime(start),
            "jam_berakhir": formatTime(end),
            "wilayah_awal": {
                // --- ZONA MERAH (INTENSITAS TINGGI - HULU & PEDALAMAN) ---
                "Kabupaten Kapuas Hulu": [
                    "Putussibau Utara", "Putussibau Selatan", "Bika", "Embaloh Hilir", 
                    "Embaloh Hulu", "Bunut Hilir", "Bunut Hulu", "Boyan Tanjung", 
                    "Mentebah", "Silat Hilir", "Silat Hulu", "Semitau", "Batang Lupar",
                    "Badau", "Empanang", "Puring Kencana"
                ],
                "Kabupaten Sintang": [
                    "Sintang", "Sungai Tebelian", "Tempunak", "Sepauk", "Dedai", 
                    "Kayan Hilir", "Kayan Hulu", "Ketungau Hilir", "Ketungau Tengah", 
                    "Ketungau Hulu", "Serawai", "Ambalau", "Kelam Permai", "Binjai Hulu"
                ],
                "Kabupaten Melawi": [
                    "Nanga Pinoh", "Pinoh Selatan", "Pinoh Utara", "Belimbing", 
                    "Belimbing Hulu", "Ella Hilir", "Menukung", "Sayan", "Tanah Pinoh",
                    "Tanah Pinoh Barat", "Sokan"
                ],
                "Kabupaten Sekadau": [
                    "Sekadau Hilir", "Sekadau Hulu", "Nanga Taman", "Nanga Mahap", 
                    "Belitang Hilir", "Belitang Hulu", "Belitang"
                ]
            },
            "wilayah_meluas": {
                // --- ZONA KUNING (POTENSI MELUAS - PESISIR & TENGAH) ---
                "Kabupaten Sanggau": [
                    "Kapuas", "Mukok", "Jangkang", "Bonti", "Parindu", "Tayan Hilir", 
                    "Tayan Hulu", "Balai", "Toba", "Meliau", "Sekayam", "Entikong", 
                    "Beduai", "Noyan", "Kembayan"
                ],
                "Kabupaten Landak": [
                    "Ngabang", "Jelimpo", "Sengah Temila", "Mandor", "Menjalin", 
                    "Mempawah Hulu", "Sebangki", "Air Besar", "Kuala Behe", "Menyuke",
                    "Meranti", "Someter"
                ],
                "Kabupaten Bengkayang": [
                    "Bengkayang", "Teriak", "Sungai Betung", "Ledo", "Suti Semarang", 
                    "Lumar", "Sanggau Ledo", "Jagoi Babang", "Seluas", "Tujuh Belas"
                ],
                "Kabupaten Sambas": [
                    "Sambas", "Teluk Keramat", "Tebas", "Semparuk", "Pemangkat", "Selakau",
                    "Sajad", "Sejangkung", "Paloh", "Sajingan Besar", "Subah", "Galing",
                    "Tangaran", "Jawai", "Jawai Selatan", "Sebawi", "Tekarang"
                ],
                "Kota Singkawang": [
                    "Singkawang Barat", "Singkawang Tengah", "Singkawang Timur", 
                    "Singkawang Utara", "Singkawang Selatan"
                ],
                "Kabupaten Mempawah": [
                    "Mempawah Hilir", "Mempawah Timur", "Sungai Pinyuh", "Sungai Kunyit", 
                    "Segedong", "Jongkat", "Toho", "Sadaniang", "Anjongan"
                ],
                "Kota Pontianak": [
                    "Pontianak Kota", "Pontianak Barat", "Pontianak Selatan", 
                    "Pontianak Tenggara", "Pontianak Timur", "Pontianak Utara"
                ],
                "Kabupaten Kubu Raya": [
                    "Sungai Raya", "Sungai Kakap", "Kuala Mandor B", "Sungai Ambawang", 
                    "Rasau Jaya", "Kubu", "Teluk Pakedai", "Batu Ampar", "Terentang"
                ],
                "Kabupaten Ketapang": [
                    "Delta Pawan", "Muara Pawan", "Benua Kayong", "Matan Hilir Selatan", 
                    "Matan Hilir Utara", "Kendawangan", "Sandai", "Nanga Tayap", 
                    "Hulu Sungai", "Simpang Dua", "Simpang Hulu", "Sungai Laur"
                ],
                "Kabupaten Kayong Utara": [
                    "Sukadana", "Simpang Hilir", "Teluk Batang", "Seponti", "Pulau Maya",
                    "Kepulauan Karimata"
                ]
            }
        }
    };
};
