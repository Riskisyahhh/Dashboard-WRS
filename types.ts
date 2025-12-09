export interface AreaData {
    kabupaten: string;
    level: 'awas' | 'waspada' | 'aman';
    kecamatan: string[];
    coords: number[];
    forecast: string;
    impacts: string[];
}

export interface WarningData {
    date: string;
    time: string;
    valid_until: string;
    summary: string;
    areas: AreaData[];
}

export type WarningLevel = 'none' | 'pre' | 'active';

export interface GeoJSONProperties {
    status: string;
    description: string;
    severity: string;
}

export interface SimulationState {
    currentTime: Date;
    isPaused: boolean;
    warningLevel: WarningLevel;
    geoJsonData: any | null; 
}