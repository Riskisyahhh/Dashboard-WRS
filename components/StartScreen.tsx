import React from 'react';
import { Power, ArrowRight } from 'lucide-react';

interface StartScreenProps {
    onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    return (
        <div className="relative w-full h-screen bg-luxury-dark overflow-hidden flex items-center justify-center font-sans selection:bg-gold-500/30 text-white">
            
            {/* 1. BACKGROUND LAYERS */}
            <div className="absolute inset-0 z-0">
                 {/* Deep Blue Base */}
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a1124] to-black opacity-90"></div>
                 
                 {/* World Map Texture (Abstract Gold Lines) */}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center animate-pulse-slow mix-blend-overlay filter sepia saturate-200 hue-rotate-15"></div>
    
                 {/* Gold Particles */}
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     {[...Array(20)].map((_, i) => (
                         <div 
                            key={i}
                            className="absolute rounded-full bg-gold-400 opacity-60 animate-float blur-[1px]"
                            style={{
                                width: Math.random() * 4 + 1 + 'px',
                                height: Math.random() * 4 + 1 + 'px',
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%',
                                animationDuration: 10 + Math.random() * 20 + 's',
                                animationDelay: Math.random() * 5 + 's'
                            }}
                         ></div>
                     ))}
                 </div>
            </div>
    
            {/* 2. CENTER CARD: THE "MONOLITH" */}
            <div className="relative z-20 w-full max-w-4xl p-8 flex flex-col items-center">
                 
                 <div className="relative backdrop-blur-3xl bg-slate-950/60 border border-white/5 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] px-16 py-20 flex flex-col items-center overflow-hidden group">
                     
                     {/* Luxury Border Gradient */}
                     <div className="absolute inset-0 rounded-2xl border-[1.5px] border-transparent bg-gradient-to-b from-gold-300/30 via-transparent to-gold-600/30 [mask-image:linear-gradient(white,white)] pointer-events-none"></div>
                     
                     {/* Top Shine */}
                     <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[50%] bg-gradient-to-b from-white/10 to-transparent rotate-12 blur-3xl pointer-events-none"></div>
    
                     {/* LOGO AREA */}
                     <div className="relative mb-10">
                         <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>
                         <div className="relative z-10 p-4 bg-slate-900/40 rounded-full border border-gold-500/20 backdrop-blur-md shadow-2xl">
                             <img 
                               src="https://api.imgbb.com/1/upload" 
                               alt="BMKG" 
                               className="w-28 h-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                             />
                         </div>
                     </div>
    
                     {/* TYPOGRAPHY */}
                     <div className="text-center space-y-4 mb-14 relative z-10">
                         <div className="flex items-center justify-center gap-4 text-gold-200/60 mb-2">
                             <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-400"></div>
                             <span className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase">Stasiun Meteorologi</span>
                             <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-400"></div>
                         </div>
                         
                         <h1 className="font-serif text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-200 to-gold-500 drop-shadow-sm tracking-wide">
                            BMKG MARITIM
                         </h1>
                         
                         <div className="text-xl md:text-2xl font-light text-slate-300 tracking-[0.5em] uppercase font-sans mt-2">
                             PONTIANAK
                         </div>
                         
                         <p className="max-w-lg mx-auto text-xs text-slate-400/80 mt-6 leading-relaxed font-sans tracking-wide">
                            Sistem dashboard taktis terintegrasi untuk pemantauan cuaca maritim dan peringatan dini wilayah Kalimantan Barat.
                         </p>
                     </div>
    
                     {/* ACTION BUTTON */}
                     <button 
                        onClick={onStart}
                        className="group relative px-14 py-4 overflow-hidden rounded-sm transition-all duration-500"
                     >
                         <div className="absolute inset-0 bg-gradient-to-r from-gold-900/40 to-slate-900/40 border border-gold-500/30 group-hover:border-gold-400/60 transition-colors"></div>
                         <div className="absolute inset-0 bg-gold-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                         
                         <div className="relative flex items-center gap-3 text-gold-100 font-sans text-sm font-semibold tracking-widest uppercase group-hover:text-white transition-colors">
                             <Power size={18} className="text-gold-400 group-hover:text-white transition-colors" />
                             <span>Akses Dashboard</span>
                             <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"/>
                         </div>
                     </button>
    
                     {/* Bottom Status */}
                     <div className="absolute bottom-4 flex gap-6 text-[9px] text-gold-200/30 font-mono tracking-widest uppercase">
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>Server Online</span>
                        <span>Secure Connection</span>
                        <span>v2.5.0-GOLD</span>
                     </div>
                 </div>
            </div>
            
          </div>
    );
};
