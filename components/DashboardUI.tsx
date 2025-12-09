import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, CloudRain, Wind, Thermometer, Droplets, Umbrella, CloudLightning, MapPin, AlertCircle, Info, ChevronRight, Activity, Zap, Radio, BarChart3, PieChart, Layers, Clock, Calendar, X, List, ShieldAlert, AlertOctagon, CheckCircle2, Radar, Target, Sun, Cloud, RefreshCw, BookOpen } from 'lucide-react';
import { SimulationState, WarningData } from '../types';

interface DashboardUIProps {
    simState: SimulationState;
    alertData: WarningData;
    onSetTime: (h: number, m: number) => void;
    onTogglePause: () => void;
    userTimeZone: string;
    toast: { message: string, type: 'error' | 'info' } | null;
    useLiveData: boolean;
    onToggleDataSource: () => void;
}

export const DashboardUI: React.FC<DashboardUIProps> = ({ simState, alertData, onSetTime, onTogglePause, userTimeZone, toast, useLiveData, onToggleDataSource }) => {
    
    // --- Mock Data States for Visuals Only (Telemetry) ---
    const [rainRate, setRainRate] = useState(0);
    const [windSpeed, setWindSpeed] = useState(10);
    const [showDetails, setShowDetails] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);
    
    // Efek visual telemetri (angin/hujan) tetap berjalan random agar dashboard terlihat hidup
    useEffect(() => {
        if (simState.isPaused) return;
        const interval = setInterval(() => {
            if (simState.warningLevel === 'active') {
                setRainRate(prev => Math.max(0, parseFloat((prev + (Math.random() - 0.4) * 8).toFixed(1))));
                setWindSpeed(prev => Math.min(80, Math.max(35, Math.floor(prev + (Math.random() - 0.5) * 6))));
            } else {
                setRainRate(0);
                setWindSpeed(10 + Math.floor(Math.random() * 5));
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [simState.isPaused, simState.warningLevel]);

    // Format Helpers
    const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: userTimeZone }).replace(/\./g, ':');
    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: userTimeZone });

    const isActive = simState.warningLevel === 'active' || simState.warningLevel === 'pre';
    
    const marqueeText = simState.warningLevel === 'active' || simState.warningLevel === 'pre'
        ? `>>> PERINGATAN DINI CUACA KALIMANTAN BARAT (LIVE BMKG): ${alertData.summary} <<< ` 
        : ">>> LIVE DATA SERVER BMKG TERHUBUNG. SAAT INI TIDAK ADA PERINGATAN DINI SIGNIFIKAN UNTUK WILAYAH KALIMANTAN BARAT. MASYARAKAT DIHARAP TETAP MEMANTAU INFORMASI TERKINI <<< ";

    // Helper to truncate long text
    const getSummaryPreview = (text: string) => {
        if (!text) return "Memuat data...";
        if (text.length <= 200) return text;
        return text.substring(0, 200) + '...';
    };

    // --- GLOSSARY DATA ---
    const glossaryItems = [
        { term: "WRS (Warning Receiver System)", def: "Sistem komunikasi terintegrasi BMKG untuk menyebarluaskan informasi peringatan dini cuaca secara real-time." },
        { term: "Cuaca Ekstrem", def: "Fenomena cuaca yang berpotensi menimbulkan bencana (Hujan lebat, angin kencang, petir, puting beliung, hujan es)." },
        { term: "Peringatan Dini Cuaca", def: "Informasi prediksi jangka pendek (Nowcasting) mengenai potensi cuaca ekstrem (Hujan Lebat, Petir, Angin) agar masyarakat dapat bersiaga lebih awal." },
        { term: "Valid Until", def: "Masa berlaku peringatan. Jika lewat waktu dan tidak ada update, kondisi dianggap kembali normal/aman." },
        { term: "Potensi Meluas", def: "Prediksi pergerakan sel awan hujan ke wilayah kecamatan tetangga dalam 1-2 jam ke depan." },
        { term: "Hujan Sedang-Lebat", def: "Intensitas hujan 20-50 mm/jam (Sedang) hingga >50 mm/jam (Lebat) yang dapat memicu genangan." },
        { term: "Angin Kencang", def: "Kecepatan angin >45 km/jam yang dapat merusak bangunan semi permanen atau menumbangkan pohon." },
        { term: "Kondusif / Nihil", def: "Tidak ada fenomena cuaca signifikan yang terdeteksi oleh radar atau satelit." }
    ];

    // --- THEME CONFIGURATION ---
    const theme = isActive ? {
        panelBorder: "border-red-500/50",
        panelGlow: "shadow-[0_0_40px_rgba(220,38,38,0.5)]",
        iconColor: "text-red-500",
        textColor: "text-white",
        accentColor: "text-red-500",
        subTextColor: "text-red-200",
        bgGradient: "bg-gradient-to-br from-red-950/95 via-red-900/90 to-black/90",
        gridColor: "#ef4444", // Red-500
        headerBg: "bg-red-950/80",
        headerBorder: "border-red-600",
        pulseAnimation: "animate-pulse",
        tickerBg: "bg-red-900",
        tickerText: "text-white",
        vignette: "shadow-[inset_0_0_150px_rgba(185,28,28,0.4)]",
        bgImage: "", // No image for alert, just dark tactical
        textShadow: ""
    } : {
        // SUNNY / CLOUDY THEME
        panelBorder: "border-white/60",
        panelGlow: "shadow-[0_10px_40px_rgba(14,165,233,0.4)]",
        iconColor: "text-yellow-300 drop-shadow-md",
        textColor: "text-white",
        accentColor: "text-white",
        subTextColor: "text-blue-50",
        bgGradient: "bg-gradient-to-b from-blue-400/80 to-blue-600/80", // Fallback
        gridColor: "rgba(255,255,255,0.3)",
        headerBg: "bg-white/20",
        headerBorder: "border-white/40",
        pulseAnimation: "",
        tickerBg: "bg-blue-700",
        tickerText: "text-blue-50",
        vignette: "shadow-[inset_0_0_80px_rgba(255,255,255,0.1)]",
        // Bright Blue Sky with Clouds Image
        bgImage: "url('https://images.unsplash.com/photo-1569428034239-f9565e32e224?q=80&w=1000&auto=format&fit=crop')",
        textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
    };

    return (
        <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none font-sans text-slate-800 overflow-hidden">
            
            {/* === WEATHER AMBIENT OVERLAYS === */}
            
            {/* Vignette for Atmosphere */}
            <div className={`absolute inset-0 z-0 transition-all duration-1000 pointer-events-none ${theme.vignette}`}></div>

            {/* Lightning Flash (Extreme Only) */}
            {isActive && (
                <div className="absolute inset-0 bg-white z-[1] pointer-events-none animate-flash mix-blend-overlay"></div>
            )}

            {/* Rain Drops (Extreme Only) - Dashboard Overlay Version */}
            {isActive && (
                <div className="rain-container z-[2]">
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i} 
                            className="rain-drop" 
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>
            )}


            {/* ================= TOP ROW ================= */}
            <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-50">
                
                {/* --- LEFT PANEL: OBSERVASI TERAKHIR (Dynamic Theme) --- */}
                <div 
                    className={`pointer-events-auto w-80 rounded-xl overflow-hidden border ${theme.panelBorder} ${theme.panelGlow} backdrop-blur-md flex flex-col group transition-all duration-700 bg-cover bg-center shadow-2xl`}
                    style={{ backgroundImage: theme.bgImage || undefined }}
                >
                    {/* Gradient Overlay for Readability */}
                    <div className={`absolute inset-0 ${theme.bgGradient} transition-colors duration-700`}></div>

                    {/* Header Bar */}
                    <div className={`${theme.headerBg} px-4 py-2 flex justify-between items-center border-b ${theme.headerBorder} relative overflow-hidden transition-colors duration-500 backdrop-blur-sm z-10`}>
                        <div className="flex items-center gap-2 z-10">
                            <Target size={14} className={`${theme.accentColor} animate-spin-slow`} />
                            <span className={`font-mono text-[10px] font-bold ${theme.accentColor} uppercase tracking-widest ${theme.textShadow}`}>
                                :: {isActive ? 'PERINGATAN BAHAYA' : 'PEMANTAUAN NORMAL'} ::
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <div className={`w-1 h-3 rounded-sm ${isActive ? 'bg-red-500/50' : 'bg-white/50'}`}></div>
                            <div className={`w-1 h-3 rounded-sm ${isActive ? 'bg-red-500' : 'bg-white'}`}></div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-4 relative z-10">
                        {/* Background Grid Texture */}
                        <div className="absolute inset-0 z-0 opacity-30" 
                             style={{backgroundImage: `radial-gradient(circle, ${theme.gridColor} 1px, transparent 1px)`, backgroundSize: '20px 20px'}}>
                        </div>

                        {/* Top Section: Region & Status */}
                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div>
                                <div className={`text-[10px] ${theme.subTextColor} font-mono uppercase tracking-wider mb-0.5 ${theme.textShadow}`}>Pantauan Area</div>
                                <div className={`text-lg font-black ${theme.textColor} tracking-wide ${theme.textShadow} leading-tight`}>Kalimantan Barat</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${isActive ? 'bg-red-900/60 border-red-400 text-white animate-pulse' : 'bg-emerald-500/80 border-white/50 text-white backdrop-blur-md'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500' : 'bg-white'}`}></div>
                                    {isActive ? 'STATUS: AWAS' : 'STATUS: AMAN'}
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Time & Weather Icon */}
                        <div className={`relative z-10 flex items-center gap-4 py-4 border-y ${isActive ? 'border-red-500/30' : 'border-white/30'}`}>
                            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-500 ${isActive ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/20 border-white/60 text-yellow-300'}`}>
                                {isActive ? <CloudLightning size={36} className="animate-pulse drop-shadow-lg" /> : <Sun size={36} className="animate-spin-slow drop-shadow-md text-yellow-300 fill-yellow-300" />}
                            </div>
                            <div>
                                <div className={`text-4xl font-mono font-bold ${theme.textColor} leading-none tracking-tight tabular-nums ${theme.textShadow}`}>
                                    {formatTime(simState.currentTime)}
                                </div>
                                <div className={`text-xs ${theme.subTextColor} font-mono uppercase tracking-widest mt-1.5 font-bold ${theme.textShadow}`}>
                                    {formatDate(simState.currentTime)}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Telemetry Data */}
                        <div className="relative z-10 mt-4 space-y-2">
                            {/* Location */}
                            <div className="flex items-center justify-between text-xs font-mono">
                                <div className={`flex items-center gap-2 ${theme.subTextColor} ${theme.textShadow}`}>
                                    <MapPin size={12} className={isActive ? "text-red-400" : "text-white"}/>
                                    <span>POSISI</span>
                                </div>
                                <div className="text-right">
                                    <span className={`block ${theme.textColor} font-bold ${theme.textShadow}`}>0.02 LS, 109.34 BT</span>
                                    <span className={`block text-[10px] font-bold uppercase ${isActive ? 'text-red-300' : 'text-blue-100'} ${theme.textShadow}`}>|| Pontianak</span>
                                </div>
                            </div>
                            
                            {/* Wind */}
                            <div className="flex items-center justify-between text-xs font-mono">
                                <div className={`flex items-center gap-2 ${theme.subTextColor} ${theme.textShadow}`}>
                                    <Wind size={12} className={isActive ? "text-red-400" : "text-white"}/>
                                    <span>ANGIN</span>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold ${theme.textColor} ${theme.textShadow}`}>{windSpeed} km/j</span>
                                    <span className={`text-[10px] ml-1 ${isActive ? 'text-red-300' : 'text-blue-100'} ${theme.textShadow}`}>(Barat Laut)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: WARNING BULLETIN (Gaya WRS) --- */}
                <div className="pointer-events-auto flex flex-col items-end gap-1">
                    
                    {/* Header Merah/Kuning */}
                    <div className="flex shadow-lg h-14 w-96 bg-white border border-gray-300">
                        <div className={`w-24 flex items-center justify-center text-white font-black text-xl tracking-wide ${isActive ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}>
                            {isActive ? 'AWAS' : 'AMAN'}
                        </div>
                        <div className={`flex-1 flex flex-col justify-center px-3 border-l border-white/20 ${isActive ? 'bg-yellow-300' : 'bg-gray-50'}`}>
                            <div className="font-black text-xs text-black tracking-tight">INFO RESMI BMKG</div>
                            <div className="font-bold text-[10px] text-gray-800 uppercase tracking-wide">
                                {isActive ? 'PERINGATAN DINI CUACA EKSTREM' : 'PRAKIRAAN CUACA NORMAL'}
                            </div>
                            <div className="text-[9px] text-gray-600 font-mono mt-0.5 opacity-80">Valid: {alertData.valid_until}</div>
                        </div>
                    </div>

                    {/* Blue Bar */}
                    <div className={`w-96 text-white text-[10px] font-bold text-center py-0.5 shadow-md tracking-widest ${isActive ? 'bg-red-900' : 'bg-blue-900'}`}>
                        MODE OPERASIONAL - WRS (LIVE DATA)
                    </div>

                    {/* Detail Table Panel */}
                    <div className="w-96 bg-white shadow-xl border border-gray-300 text-xs flex flex-col">
                        {/* 3 Columns Info */}
                        <div className="grid grid-cols-3 border-b border-gray-300 bg-gray-50 divide-x divide-gray-200">
                            <div className="p-2 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-semibold mb-0.5">Potensi</div>
                                <div className={`font-bold ${isActive ? 'text-red-600' : 'text-blue-600'}`}>
                                    {isActive ? 'Hujan Petir' : 'Cerah Berawan'}
                                </div>
                            </div>
                            <div className="p-2 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-semibold mb-0.5">Lokasi</div>
                                <div className="font-bold text-orange-600">Kalbar</div>
                            </div>
                            <div className="p-2 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-semibold mb-0.5">Dampak</div>
                                <div className={`font-bold ${isActive ? 'text-red-700' : 'text-green-700'}`}>
                                    {isActive ? 'Banjir' : 'Nihil'}
                                </div>
                            </div>
                        </div>

                        {/* Description Box - FIX: Truncate longer texts */}
                        <div className={`${isActive ? 'bg-red-800' : 'bg-teal-700'} text-white p-3 text-[10px] leading-relaxed relative max-h-40 group transition-colors duration-500 pr-1`}>
                            <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none"><Info size={40} /></div>
                            <span className="text-yellow-300 font-bold block mb-1 uppercase tracking-wide border-b border-white/20 pb-1">Info Cuaca:</span> 
                            <p className="relative z-10 break-words whitespace-pre-wrap">
                                {getSummaryPreview(alertData.summary)}
                            </p>
                            {isActive && (
                                <button 
                                    onClick={() => setShowDetails(true)}
                                    className="mt-2 flex items-center gap-1 text-yellow-300 text-[9px] font-bold bg-black/20 hover:bg-black/30 px-2 py-1.5 rounded transition-all cursor-pointer border border-transparent hover:border-yellow-300/30 relative z-10 w-full justify-center shadow-sm"
                                >
                                    <ChevronRight size={12}/> Lihat Detail Wilayah Lengkap
                                </button>
                            )}
                        </div>

                        {/* Alert Message */}
                        {isActive && (
                            <div className="bg-red-50 text-red-800 p-2 border-l-4 border-red-500 flex gap-2 items-start text-[10px]">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                                <span className="font-medium">Peringatan ini berlaku segera untuk diteruskan kepada masyarakat terdampak.</span>
                            </div>
                        )}

                        {/* Himbauan Box */}
                        <div className={`${isActive ? 'bg-orange-600' : 'bg-blue-500'} text-white p-2 text-[10px]`}>
                            <div className="font-bold italic flex items-center gap-1 mb-1 border-b border-white/20 pb-1">
                                <Radio size={12}/> Arahan BMKG
                            </div>
                            <p className="leading-snug opacity-95">
                                {isActive ? "Hati-hati terhadap potensi genangan, banjir bandang, dan pohon tumbang." : "Kondisi cuaca mendukung untuk aktivitas luar ruangan."}
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex bg-gray-50 text-[9px] divide-x divide-gray-300 border-t border-gray-200 text-gray-600 font-bold">
                            <button 
                                onClick={() => window.open('https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca', '_blank')}
                                className="flex-1 py-2 hover:bg-gray-100 transition-colors uppercase tracking-tight"
                            >
                                WRS Website
                            </button>
                            <button 
                                onClick={() => window.open('https://signature.bmkg.go.id/', '_blank')}
                                className="flex-1 py-2 hover:bg-gray-100 transition-colors uppercase tracking-tight"
                            >
                                Peta Bahaya
                            </button>
                            <button 
                                onClick={() => setShowGlossary(true)}
                                className="flex-1 py-2 hover:bg-gray-100 transition-colors uppercase tracking-tight flex items-center justify-center gap-1"
                            >
                                Glosary
                            </button>
                        </div>
                        <div className="bg-gray-200 text-[9px] text-gray-500 text-center py-0.5 font-mono">
                            © 2025 BMKG - Meteorological Department
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM ROW ================= */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col pointer-events-none">
                
                {/* Upper Bottom: Legend & Controls */}
                <div className="p-2 flex items-end justify-between w-full">
                    {/* --- LEFT: LEGEND & WRS STATUS --- */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        {/* Legend Box - UPDATED */}
                        <div className="bg-white/95 shadow-md border border-gray-300 p-2 w-64 rounded-sm">
                            <div className="text-[10px] font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1 uppercase tracking-wide">
                                ::Legenda Peta::
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-[9px] text-gray-500 font-bold mb-1 uppercase tracking-tight">Level Peringatan</div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-3 bg-green-500 rounded-sm shadow-sm border border-black/5"></div>
                                            <span className="text-[9px] font-bold text-gray-600 uppercase">Wilayah Tidak Terdampak</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-3 bg-yellow-400 rounded-sm shadow-sm border border-black/10"></div>
                                            <span className="text-[9px] font-bold text-gray-800 uppercase">Wilayah Potensi Meluas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-3 bg-red-600 rounded-sm shadow-sm border border-black/10 animate-pulse"></div>
                                            <span className="text-[9px] font-black text-red-700 uppercase tracking-tight">Wilayah Peringatan Dini</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WRS Status Box */}
                        <div className="flex bg-blue-50 border border-blue-300 h-12 w-64 shadow-lg">
                            <div className="w-12 bg-white flex items-center justify-center border-r border-blue-200">
                                <img src="https://www.bmkg.go.id/images/profil/logo-bmkg.png" className="h-8 w-auto" alt="BMKG"/>
                            </div>
                            <div className="w-20 bg-gray-50 flex flex-col items-center justify-center border-r border-blue-200 px-1">
                                <span className="text-red-600 font-black text-xl leading-none tracking-tighter">WRS</span>
                                <span className="text-[5px] font-bold text-gray-500 uppercase tracking-widest text-center mt-0.5">Warning Receiver System</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-blue-900 font-bold font-mono text-xs bg-blue-100/30">
                                <div>{formatDate(simState.currentTime)}</div>
                                <div className="text-sm tracking-tight">{formatTime(simState.currentTime)}</div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: LOGO BANNER & CONTROLS --- */}
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                        
                        {/* Refresh Button */}
                        <button 
                            onClick={onToggleDataSource}
                            className="px-4 py-2 rounded-full font-bold text-xs shadow-lg border transition-all flex items-center gap-2 bg-red-600 text-white border-red-500 hover:bg-red-700"
                        >
                            <RefreshCw size={14} className="animate-spin-slow" />
                            LIVE DATA AKTIF
                        </button>

                        {/* Logo Banner */}
                        <div className="w-64 bg-white shadow-xl border border-gray-300 h-16 flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <img src="https://developing-red-fsv36kxbtl-n3c8paa5er.edgeone.dev/Sistem%20Peringatan%20Dini%20Cuaca%20Indonesia-Photoroom.png" className="h-10 w-auto" alt="BMKG"/>
                                <div className="flex flex-col border-l-2 border-gray-300 pl-3">
                                    <span className="font-black text-gray-800 text-lg leading-none tracking-tighter">INAWEWS-BMKG</span>
                                    <span className="font-bold text-gray-500 text-[10px] tracking-[0.3em] uppercase mt-0.5">Indonesia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RUNNING TEXT TICKER (SEAMLESS INFINITE LOOP) - Dynamic Colors */}
                <div className={`${theme.tickerBg} ${theme.tickerText} border-t-2 ${isActive ? 'border-red-500' : 'border-blue-500'} h-9 flex items-center overflow-hidden relative shadow-2xl pointer-events-auto z-50 transition-colors duration-500`}>
                    
                    {/* Label Kiri */}
                    <div className={`${isActive ? 'bg-red-700' : 'bg-blue-600'} px-5 h-full flex items-center justify-center font-bold text-xs tracking-wider z-30 relative border-r border-black/10 shrink-0`}>
                        {isActive ? 'PERINGATAN DINI:' : 'INFO CUACA:'}
                    </div>

                    {/* Container Text Berjalan - Z-Index 0 agar di belakang label */}
                    <div className="flex-1 overflow-hidden relative h-full flex items-center bg-black/10 z-0 min-w-0">
                        <div className="whitespace-nowrap animate-marquee-infinite flex items-center w-max">
                            {[0, 1, 2, 3].map((i) => (
                                <span key={i} className={`mx-24 font-bold font-mono text-sm inline-block ${isActive ? 'text-yellow-300' : 'text-blue-50'}`}>
                                    {marqueeText}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Label Kanan (Waktu) */}
                    <div className={`${isActive ? 'bg-red-900' : 'bg-blue-800'} px-4 h-full flex items-center justify-center font-bold text-xs tracking-wider z-30 border-l border-white/10 shrink-0 relative`}>
                        {formatTime(simState.currentTime)} WIB
                    </div>
                </div>

            </div>

            {/* --- DETAIL MODAL --- */}
            {showDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-down border border-gray-400">
                        {/* Header */}
                        <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
                            <h2 className="font-bold text-base flex items-center gap-2">
                                <List size={18} className="text-yellow-400"/>
                                <span className="tracking-wide uppercase">Detail Wilayah Terdampak</span>
                            </h2>
                            <button 
                                onClick={() => setShowDetails(false)} 
                                className="hover:bg-slate-700 p-1 rounded-full transition-colors"
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="overflow-y-auto p-5 space-y-5 bg-gray-50 custom-scrollbar">
                            <div className="text-xs text-slate-700 border-l-4 border-blue-500 pl-3 py-2 bg-blue-100/50 rounded-r shadow-sm">
                                <strong className="block text-blue-900 mb-1 uppercase tracking-wide">Info Cuaca (Valid: {alertData.valid_until})</strong>
                                <p className="leading-relaxed font-medium whitespace-pre-wrap">{alertData.summary}</p>
                            </div>

                            <div className="space-y-3">
                                {alertData.areas.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                                        <AlertCircle size={32} className="mb-2 opacity-50"/>
                                        <span className="text-sm font-medium">Tidak ada data wilayah spesifik saat ini.</span>
                                    </div>
                                ) : (
                                    alertData.areas.map((area, idx) => (
                                        <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                            <div className={`px-4 py-2.5 flex justify-between items-center border-b border-gray-100 ${area.level === 'awas' ? 'bg-red-50' : 'bg-orange-50'}`}>
                                                <span className="font-bold text-slate-800 text-sm">{area.kabupaten}</span>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white tracking-wider shadow-sm ${area.level === 'awas' ? 'bg-red-600' : 'bg-orange-500'}`}>
                                                    {area.level.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="p-4 text-xs text-gray-700 space-y-3">
                                                <div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0"/>
                                                        <div>
                                                            <strong className="block text-gray-900 mb-1">Kecamatan Terdampak:</strong>
                                                            <p className="leading-relaxed text-gray-600">{area.kecamatan.join(", ")}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* GRID FORECAST & IMPACT */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                                    {/* Cuaca */}
                                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                                        <strong className="block text-blue-900 mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                                                            <CloudLightning size={12}/> Potensi Cuaca:
                                                        </strong>
                                                        <span className="text-slate-700 font-medium">{area.forecast}</span>
                                                    </div>

                                                    {/* Impact Details List */}
                                                    <div className="bg-red-50 p-3 rounded border border-red-100">
                                                        <strong className="block text-red-900 mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                                                            <AlertOctagon size={12}/> Dampak Signifikan:
                                                        </strong>
                                                        <ul className="grid grid-cols-1 gap-y-1.5">
                                                            {area.impacts.map((imp, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-[10px] leading-tight text-red-800">
                                                                    <span className="mt-1 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                                                                    <span>{imp}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* REKOMENDASI TINDAKAN (Action Plan) */}
                                                <div className={`mt-2 p-3 rounded border flex gap-3 ${area.level === 'awas' ? 'bg-red-100/50 border-red-200' : 'bg-orange-100/50 border-orange-200'}`}>
                                                    <div className="shrink-0 mt-0.5">
                                                        <ShieldAlert size={16} className={area.level === 'awas' ? 'text-red-600' : 'text-orange-600'}/>
                                                    </div>
                                                    <div>
                                                        <strong className={`block text-[10px] uppercase font-bold mb-1 ${area.level === 'awas' ? 'text-red-700' : 'text-orange-700'}`}>
                                                            Rekomendasi Tindakan:
                                                        </strong>
                                                        <p className="text-[10px] leading-relaxed text-slate-700">
                                                            {area.level === 'awas' 
                                                                ? "Masyarakat dihimbau untuk waspada dan siap siaga. Hindari area terbuka saat terjadi petir, jauhi pohon besar dan baliho. Persiapkan evakuasi mandiri jika terjadi kenaikan debit air yang signifikan." 
                                                                : "Masyarakat diharapkan tetap tenang namun waspada. Kurangi aktivitas di luar ruangan jika hujan deras turun. Pastikan saluran air tidak tersumbat untuk mencegah genangan lokal."
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-white p-3 text-right shrink-0 border-t border-gray-200 flex justify-end gap-2">
                             <div className="flex-1 flex items-center text-[10px] text-gray-400 italic">
                                * Data LIVE berdasarkan Peringatan Dini Cuaca BMKG (XML)
                             </div>
                            <button 
                                onClick={() => setShowDetails(false)} 
                                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow hover:bg-slate-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GLOSSARY MODAL --- */}
            {showGlossary && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-down border border-gray-400">
                        {/* Header */}
                        <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
                            <h2 className="font-bold text-base flex items-center gap-2">
                                <BookOpen size={18} className="text-yellow-400"/>
                                <span className="tracking-wide uppercase">Glosarium Istilah Cuaca</span>
                            </h2>
                            <button 
                                onClick={() => setShowGlossary(false)} 
                                className="hover:bg-slate-700 p-1 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Content List */}
                        <div className="overflow-y-auto p-5 space-y-3 bg-gray-50 custom-scrollbar">
                            {glossaryItems.map((item, idx) => (
                                <div key={idx} className="bg-white border-l-4 border-blue-500 p-3 shadow-sm rounded-r">
                                    <strong className="block text-slate-800 text-xs font-bold uppercase mb-1">{item.term}</strong>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.def}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="bg-white p-3 text-right shrink-0 border-t border-gray-200">
                            <button 
                                onClick={() => setShowGlossary(false)} 
                                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow hover:bg-slate-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOAST --- */}
            {toast && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-full max-w-sm px-4 pointer-events-none">
                     <div className={`mx-auto px-6 py-4 rounded shadow-2xl border-2 border-white text-white flex flex-col items-center text-center gap-2 animate-fade-in-down ${toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {toast.type === 'error' ? <AlertCircle size={32}/> : <Zap size={32} className="fill-yellow-300 text-yellow-300"/>}
                        <h3 className="font-bold text-sm uppercase tracking-widest">{toast.type === 'error' ? 'SYSTEM ALERT' : 'INFO SISTEM'}</h3>
                        <p className="text-xs font-mono">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};