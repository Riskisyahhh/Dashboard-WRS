

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WarningLevel, WarningData } from '../types';

interface WeatherMapProps {
    warningLevel: WarningLevel;
    geoJsonData: any | null;
    alertData: WarningData;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ warningLevel, geoJsonData, alertData }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
    
    // Refs to track previous states to prevent unnecessary re-renders/zooms
    const prevAreasRef = useRef<string>("");
    const prevGeoJsonRef = useRef<any | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Start with a view of Kalbar
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            zoomSnap: 0.25,
            zoomDelta: 0.5
        }).setView([-0.1, 110.5], 7.5); 

        // --- DEFINISI MAP LAYERS ---

        // 1. OpenStreetMap
        const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // 2. Dark Matter
        const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        });

        // 3. Satelit (Esri)
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        // Set Default Layer based on initial context (Light for visibility)
        openStreetMap.addTo(map);

        // Add Layer Control
        const baseMaps = {
            "Peta Terang (OSM)": openStreetMap,
            "Mode Gelap (Dark)": darkMatter,
            "Satelit (Esri)": satellite
        };
        L.control.layers(baseMaps, undefined, { position: 'topleft' }).addTo(map);

        // Move zoom control
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        // Add Scale Control
        L.control.scale({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Handle GeoJSON Layer & Updates
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !geoJsonData) return;

        // Serialize areas to check if they actually changed (ignore timestamp changes)
        const currentAreasStr = JSON.stringify(alertData.areas.map(a => ({ k: a.kabupaten, l: a.level })));
        const geoJsonChanged = prevGeoJsonRef.current !== geoJsonData;
        const areasChanged = prevAreasRef.current !== currentAreasStr;

        // Only update map layer if areas or GeoJSON changed
        if (!geoJsonChanged && !areasChanged && geoJsonLayerRef.current) {
            return;
        }

        prevAreasRef.current = currentAreasStr;
        prevGeoJsonRef.current = geoJsonData;

        // Clear existing layer
        if (geoJsonLayerRef.current) {
            map.removeLayer(geoJsonLayerRef.current);
            geoJsonLayerRef.current = null;
        }
        
        const shouldShow = warningLevel === 'active' || warningLevel === 'pre';
        
        const layer = L.geoJSON(geoJsonData, {
            style: (feature) => {
                let color = "#334155"; // Slate-700
                let fillColor = "#64748b"; // Slate-500
                let fillOpacity = 0.2; 
                let dashArray = ''; 
                let weight = 1.5; 

                if (shouldShow && feature?.properties) {
                    const geoName = feature.properties.NAME_2 || feature.properties.name || "";
                    
                    // Improved matching: Check if district name is contained in the warning area list
                    const areaMatch = alertData.areas.find(area => {
                        const areaName = area.kabupaten.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                        const featName = geoName.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                        return areaName === featName || areaName.includes(featName) || featName.includes(areaName);
                    });

                    if (areaMatch) {
                        if (areaMatch.level === 'awas') {
                            // AWAS (Merah)
                            color = "#dc2626"; 
                            fillColor = "#ef4444"; 
                            fillOpacity = 0.7;
                            weight = 3; 
                        } else if (areaMatch.level === 'waspada') {
                            // WASPADA (Orange)
                            color = "#ea580c"; 
                            fillColor = "#f97316"; 
                            fillOpacity = 0.6;
                            weight = 3; 
                        }
                    }
                }

                return {
                    color,
                    weight,
                    opacity: 1,
                    fillColor,
                    fillOpacity,
                    dashArray
                };
            },
            onEachFeature: (feature, layer) => {
                const geoName = feature.properties?.NAME_2 || feature.properties?.name || "Wilayah";
                
                const areaMatch = shouldShow ? alertData.areas.find(area => {
                     const areaName = area.kabupaten.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                     const featName = geoName.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                     return areaName === featName || areaName.includes(featName) || featName.includes(areaName);
                }) : null;

                if (areaMatch) {
                    const bgClass = areaMatch.level === 'awas' ? 'text-red-600' : 'text-amber-600';
                    layer.bindPopup(`
                        <div class="font-sans text-sm min-w-[220px] p-1">
                            <div class="${bgClass} font-bold text-base border-b pb-1 mb-2 border-gray-200">
                                STATUS: ${areaMatch.level.toUpperCase()}
                            </div>
                            <div class="font-bold text-gray-800 text-lg leading-tight mb-1">${areaMatch.kabupaten}</div>
                            <div class="text-xs text-gray-500 mb-2">
                                <strong>Kecamatan:</strong> ${areaMatch.kecamatan.join(", ")}
                            </div>
                            <div class="bg-gray-50 p-2 rounded text-xs border border-gray-100">
                                <div class="mb-1"><strong class="text-gray-700">Prakiraan:</strong> ${areaMatch.forecast}</div>
                            </div>
                        </div>
                    `);
                } else {
                    layer.bindPopup(`
                        <div class="font-sans text-sm p-1">
                            <strong class="text-gray-400 block mb-1 uppercase text-[10px]">Pantauan Normal</strong>
                            <span class="text-slate-700 font-bold text-base">${geoName}</span>
                        </div>
                    `);
                }
            }
        }).addTo(map);

        geoJsonLayerRef.current = layer;

        // Auto Zoom logic - Only if areas changed
        if (warningLevel === 'active' || warningLevel === 'pre') {
            // Filter layers that have warnings
            const warningLayers: L.Layer[] = [];
            layer.eachLayer((l: any) => {
                const feature = l.feature;
                const geoName = feature.properties?.NAME_2 || feature.properties?.name || "";
                const hasWarning = alertData.areas.some(area => {
                    const areaName = area.kabupaten.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                    const featName = geoName.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
                    return areaName === featName || areaName.includes(featName) || featName.includes(areaName);
                });
                if (hasWarning) {
                    warningLayers.push(l);
                }
            });

            if (warningLayers.length > 0) {
                const group = L.featureGroup(warningLayers);
                const bounds = group.getBounds();
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 9,
                        duration: 2
                    });
                }
            }
        }

    }, [warningLevel, geoJsonData, alertData.areas]); // Dependency on alertData.areas specifically

    const isExtreme = warningLevel === 'active' || warningLevel === 'pre';
    
    // Dynamic Style for Radar
    const radarGradient = isExtreme 
        ? "conic-gradient(from 0deg, transparent 0deg, rgba(220,38,38,0.01) 280deg, rgba(220,38,38,0.2) 320deg, rgba(220,38,38,0.6) 360deg)"
        : "conic-gradient(from 0deg, transparent 0deg, rgba(14,165,233,0.01) 280deg, rgba(14,165,233,0.2) 320deg, rgba(14,165,233,0.5) 360deg)";
    
    const radarBorder = isExtreme ? "border-red-600/50" : "border-blue-500/30";
    const ringBorder = isExtreme ? "border-red-700" : "border-blue-400";

    return (
        <div className="w-full h-full absolute inset-0 z-0 bg-[#0f172a] overflow-hidden">
             {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
            
            {/* Rain Animation Layer - Only active during Warning (High Z-Index but below UI) */}
            {isExtreme && (
                <div className="absolute inset-0 z-[500] pointer-events-none">
                    {[...Array(100)].map((_, i) => (
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

            {/* Radar Overlay */}
            <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden">
                 <div 
                    className={`w-[150vmax] h-[150vmax] rounded-full border-[0.5px] ${radarBorder} animate-radar-spin mix-blend-screen opacity-40`}
                    style={{ background: radarGradient }}
                 ></div>
                 <div className={`absolute w-[400px] h-[400px] rounded-full border ${ringBorder}/30 animate-ping-slow`}></div>
            </div>
        </div>
    );
};

export default WeatherMap;
