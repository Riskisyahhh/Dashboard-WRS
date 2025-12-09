import React, { useState, useEffect, useCallback, useRef } from 'react';
import WeatherMap from './components/WeatherMap';
import { DashboardUI } from './components/DashboardUI';
import { StartScreen } from './components/StartScreen';
import { SimulationState, WarningLevel, WarningData, AreaData } from './types';
import { KALBAR_GEOJSON_FALLBACK, GEOJSON_URL } from './data/geoJson';
import { soundEngine } from './utils/SoundEngine';
import { BMKG_ENDPOINT, PROXY_LIST, DEFAULT_DATA, REFRESH_INTERVAL_MS } from './utils/constants';
import { getCoords } from './data/coordinates';

const App: React.FC = () => {
  // --- State Management ---
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // LIVE DATA ONLY
  const [warningData, setWarningData] = useState<WarningData>(DEFAULT_DATA);
  const [isPaused, setIsPaused] = useState(false);
  const [warningLevel, setWarningLevel] = useState<WarningLevel>('none');
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);
  const [lastFetchStatus, setLastFetchStatus] = useState<string>("Menunggu Koneksi...");
  
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  
  const prevWarningLevelRef = useRef<WarningLevel>('none');
  const userTimeZone = 'Asia/Jakarta';

  // --- Helpers ---
  const showToast = useCallback((message: string, type: 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // --- 0. FETCH GEOJSON ---
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        console.log("Detailed GeoJSON loaded");
        setGeoJsonData(data);
      })
      .catch(err => {
        console.warn("Using Fallback GeoJSON", err);
        setGeoJsonData(KALBAR_GEOJSON_FALLBACK);
      });
  }, []);

  // --- 1. FETCH & PARSE REAL DATA (PYTHON LOGIC PORT) ---
  const fetchData = useCallback(async () => {
    let success = false;
    let errorLog = "";

    // Iterate through proxies until one works
    for (const proxy of PROXY_LIST) {
        if (success) break;

        try {
            setLastFetchStatus(`Mencoba jalur ${proxy.id}...`);
            const proxyUrl = proxy.url(BMKG_ENDPOINT);
            
            // Add referrerPolicy to help with some proxy blocks
            const res = await fetch(proxyUrl, { 
                cache: 'no-store',
                referrerPolicy: 'no-referrer'
            });
            
            if (!res.ok) {
                errorLog += `[${proxy.id}: ${res.status}] `;
                continue; // Try next proxy
            }
            
            let htmlText = "";
            if (proxy.isJson) {
                const json = await res.json();
                htmlText = json.contents;
            } else {
                htmlText = await res.text();
            }
            
            if (!htmlText || htmlText.trim().length === 0) {
                 errorLog += `[${proxy.id}: Empty] `;
                 continue;
            }

            // --- PYTHON LOGIC IMPLEMENTATION ---
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, "text/html");
            
            // 1. Find <p class="prose">
            const pProse = doc.querySelector("p.prose") || doc.querySelector(".prose p");
            
            if (pProse) {
                const fullHtml = pProse.innerHTML;
                const fullText = pProse.textContent || "";
                
                // 2. Extract Times
                // Regex: pada pkl 16:15 WIB
                const timeMatch = fullText.match(/pada pkl\s*([0-9:]+)\s*WIB/i);
                // Regex: berlangsung hingga pkl 19:15 WIB
                const validUntilMatch = fullText.match(/berlangsung hingga pkl\s*([0-9:]+)\s*WIB/i);
                
                const timeStr = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
                const validUntilStr = validUntilMatch ? validUntilMatch[1] + " WIB" : "-";
                
                // 3. Extract Blocks using Regex on HTML
                // Block 1: Wilayah Awal (AWAS)
                const block1Regex = /berpotensi terjadi hujan.*?di\s*([\s\S]*?)\s*(?:Dan dapat meluas ke wilayah|$)/i;
                const block1Match = fullHtml.match(block1Regex);
                const block1Html = block1Match ? block1Match[1] : "";

                // Block 2: Wilayah Meluas (WASPADA)
                const block2Regex = /Dan dapat meluas ke wilayah\s*([\s\S]*?)\s*(?:Kondisi ini diperkirakan|$)/i;
                const block2Match = fullHtml.match(block2Regex);
                const block2Html = block2Match ? block2Match[1] : "";

                // Helper to parse <strong>Kabupaten</strong>: kecamatan, ...
                const parseKabKec = (htmlSegment: string, level: 'awas' | 'waspada'): AreaData[] => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlSegment;
                    const strongs = tempDiv.getElementsByTagName('strong');
                    const results: AreaData[] = [];

                    for (let i = 0; i < strongs.length; i++) {
                        const s = strongs[i];
                        const kabNameRaw = s.textContent?.trim().replace(/:/g, "") || "";
                        
                        // Parse Kecamatan (Next sibling text nodes until next strong)
                        let node = s.nextSibling;
                        let parts = [];
                        while (node) {
                            if (node.nodeName.toLowerCase() === 'strong') break;
                            if (node.nodeType === Node.TEXT_NODE) {
                                parts.push(node.textContent?.trim());
                            }
                            node = node.nextSibling;
                        }
                        const kecStr = parts.join(" ");
                        // Clean up commas and empty strings
                        const kecList = kecStr.split(",").map(k => k.trim()).filter(k => k.length > 1);

                        if (kabNameRaw && kecList.length > 0) {
                            // Determine impacts based on level
                            const forecast = level === 'awas' ? "Hujan Sedang-Lebat, Petir, Angin Kencang" : "Potensi Hujan Sedang-Lebat";
                            const impacts = level === 'awas' 
                                ? ["Jalan Licin", "Jarak Pandang Terbatas", "Potensi Genangan"]
                                : ["Waspada Petir", "Angin Kencang Sesaat"];

                            results.push({
                                kabupaten: kabNameRaw,
                                level: level,
                                kecamatan: kecList,
                                coords: getCoords(kabNameRaw),
                                forecast: forecast,
                                impacts: impacts
                            });
                        }
                    }
                    return results;
                };

                const areasAwal = parseKabKec(block1Html, 'awas');
                const areasMeluas = parseKabKec(block2Html, 'waspada');
                const allAreas = [...areasAwal, ...areasMeluas];

                // Update State
                setWarningData({
                     date: new Date().toLocaleDateString('id-ID'),
                     time: timeStr + " WIB",
                     valid_until: validUntilStr,
                     summary: fullText.substring(0, 300) + "...", // Show summary
                     areas: allAreas
                });

                // Logic Level
                if (allAreas.length > 0) {
                     const hasAwas = allAreas.some(a => a.level === 'awas');
                     const newLevel = hasAwas ? 'active' : 'pre';
                     
                     if (prevWarningLevelRef.current === 'none' || (prevWarningLevelRef.current === 'pre' && newLevel === 'active')) {
                         soundEngine.playEmergencyBell();
                         setTimeout(() => {
                            soundEngine.speak(`Peringatan Dini Cuaca Terdeteksi.`, availableVoices);
                         }, 1500);
                         showToast("PERINGATAN DINI TERDETEKSI", "error");
                     }
                     setWarningLevel(newLevel);
                     prevWarningLevelRef.current = newLevel;
                } else {
                     // DETEKSI KONDISI BERAKHIR (Dari Ada -> Tidak Ada)
                     if (prevWarningLevelRef.current === 'active' || prevWarningLevelRef.current === 'pre') {
                         soundEngine.speak("Peringatan dini cuaca telah berakhir. Kondisi aman.", availableVoices);
                         showToast("Peringatan Dini Berakhir", "info");
                     }

                     // Teks ditemukan, tapi tidak ada area (Mungkin "Kondisi Berakhir")
                     if (fullText.toLowerCase().includes("berakhir") || fullText.toLowerCase().includes("kondusif")) {
                         setWarningLevel('none');
                         prevWarningLevelRef.current = 'none';
                         setWarningData(prev => ({...prev, summary: "Peringatan Dini Cuaca telah BERAKHIR."}));
                     } else {
                        // Tidak ada area spesifik tapi ada teks, mungkin aman
                        setWarningLevel('none');
                        prevWarningLevelRef.current = 'none';
                     }
                }
                
                success = true;
                setLastFetchStatus("Data Terhubung via " + proxy.id);

            } else {
                 // No <p class="prose"> found
                 // Check if maybe standard "Tidak ada peringatan" text exists
                 
                 // DETEKSI KONDISI BERAKHIR (Dari Ada -> Tidak Ada)
                 if (prevWarningLevelRef.current === 'active' || prevWarningLevelRef.current === 'pre') {
                     soundEngine.speak("Peringatan dini cuaca telah berakhir. Kondisi aman.", availableVoices);
                     showToast("Peringatan Dini Berakhir", "info");
                 }

                 setWarningLevel('none');
                 prevWarningLevelRef.current = 'none';
                 setWarningData({
                     date: new Date().toLocaleDateString('id-ID'),
                     time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + " WIB",
                     valid_until: "-",
                     summary: "Tidak ada Peringatan Dini Cuaca Signifikan di halaman BMKG saat ini.",
                     areas: []
                 });
                 success = true;
                 setLastFetchStatus("Data Normal / Aman");
            }

        } catch (e) {
            console.warn(`Proxy ${proxy.id} Failed:`, e);
            errorLog += `[${proxy.id}: Error] `;
        }
    }

    if (!success) {
        console.error("All proxies failed:", errorLog);
        setLastFetchStatus("Gagal Koneksi Server");
        showToast("Gagal terhubung ke BMKG (Network/CORS).", "error");
        
        if (warningData.summary.includes("Menghubungkan")) {
            setWarningData(prev => ({
                ...prev,
                summary: "Koneksi ke server BMKG terganggu. Sistem sedang mencoba jalur alternatif secara otomatis..."
            }));
        }
    }
  }, [availableVoices, showToast, warningData.summary]);

  // --- Auto Refresh ---
  useEffect(() => {
      fetchData(); // Initial fetch
      const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
  }, [fetchData]);

  // --- Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Voices ---
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);


  const handleStart = () => {
    soundEngine.ensureContext();
    setHasStarted(true);
    soundEngine.speak("Sistem Dashboard Terhubung ke Live Data BMKG.", availableVoices);
  };

  const handleTogglePause = () => setIsPaused(!isPaused);
  
  const handleToggleDataSource = () => {
      fetchData();
      showToast("Memperbarui Data BMKG...", "info");
  };
  
  const handleSetTime = (h: number, m: number) => {
      const d = new Date(currentTime);
      d.setHours(h);
      d.setMinutes(m);
      setCurrentTime(d);
  };

  const simulationState: SimulationState = {
    currentTime,
    isPaused,
    warningLevel,
    geoJsonData
  };

  if (!hasStarted) {
      return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      <WeatherMap 
        warningLevel={warningLevel} 
        geoJsonData={geoJsonData} 
        alertData={warningData}
      />
      <DashboardUI 
        simState={simulationState}
        alertData={warningData}
        onSetTime={handleSetTime}
        onTogglePause={handleTogglePause}
        userTimeZone={userTimeZone}
        toast={toast}
        useLiveData={true} // Always True
        onToggleDataSource={handleToggleDataSource} // Acts as refresh now
      />
      
      {/* Status Bar Kecil untuk Debug Koneksi - Moved to Top Center to avoid overlap */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] text-[10px] text-white/80 font-mono pointer-events-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm transition-all">
          Status Koneksi: {lastFetchStatus}
      </div>
    </div>
  );
};

export default App;