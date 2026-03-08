import React, { useState, useMemo, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function CompassMap({ onOpenStream, stops = [], tripTitle = "Tokyo Trip 🇯🇵" }) {
    // Initial center (Shinjuku)
    const [viewState, setViewState] = useState({
        latitude: 35.6961,
        longitude: 139.7024,
        zoom: 13,
        padding: { top: 120, bottom: 200, left: 40, right: 40 }
    });

    // Update viewState when stops change to center on the first stop
    useEffect(() => {
        if (stops && stops.length > 0) {
            const firstStop = stops[0];
            if (firstStop.lat && firstStop.lng) {
                setViewState(prev => ({
                    ...prev,
                    latitude: firstStop.lat,
                    longitude: firstStop.lng
                }));
            }
        }
    }, [stops]);

    const [selectedMarker, setSelectedMarker] = useState(null);

    // Prepare geojson for route line
    const routeData = useMemo(() => {
        const validStops = stops.filter(s => s.lat && s.lng);
        if (validStops.length < 2) return null;
        return {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: validStops.map(stop => [stop.lng, stop.lat])
            }
        };
    }, [stops]);

    return (
        <div className="absolute inset-0 w-full h-full bg-[#E5E0D8] overflow-hidden z-0 flex flex-col antialiased">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                // Using a more standard "Real Map" look (Streets style)
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" 
            >
                {/* Route Line Layer */}
                {routeData && (
                    <Source id="trip-route" type="geojson" data={routeData}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#3B4D61',
                                'line-width': 4,
                                'line-dasharray': [2, 1],
                                'line-opacity': 0.6
                            }}
                        />
                    </Source>
                )}

                {/* Markers */}
                {stops.filter(s => s.lat && s.lng).map((stop, index) => (
                    <Marker
                        key={stop.id || index}
                        latitude={stop.lat}
                        longitude={stop.lng}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedMarker(stop);
                        }}
                    >
                        <div className={`relative z-20 group cursor-pointer`}>
                            {stop.isActive && (
                                <div className="absolute inset-0 bg-highlight rounded-full animate-ping opacity-75"></div>
                            )}
                            <div className={`relative flex items-center justify-center w-10 h-10 text-white rounded-full shadow-floating text-sm font-bold border-2 border-white transition-transform transform group-hover:scale-110 ${stop.isCompleted ? 'bg-success' : stop.isActive ? 'bg-highlight' : 'bg-primary'}`}>
                                {stop.isCompleted ? (
                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                ) : (
                                    index + 1
                                )}
                            </div>
                        </div>
                    </Marker>
                ))}

                <GeolocateControl position="top-right" />
                <NavigationControl position="top-right" />
            </Map>

            {/* UI Overlay Layer */}
            <div className="absolute inset-0 z-40 flex flex-col h-full pointer-events-none">
                {/* Responsive Header Overlay */}
                <header className="w-full pt-12 pb-6 px-4 md:px-8 bg-gradient-to-b from-white/95 via-white/60 to-transparent pointer-events-auto">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">{tripTitle}</h1>
                            <div className="flex items-center gap-2 text-muted text-xs md:text-sm font-medium mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-highlight animate-pulse"></span>
                                <span>Trip Overview</span>
                                <span>•</span>
                                <span>{stops.length} destinations</span>
                            </div>
                        </div>
                        <button 
                            onClick={onOpenStream}
                            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-soft border border-gray-100 flex items-center justify-center text-primary hover:bg-gray-50 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </header>

                {/* Tooltip Card Overlay (Responsive Positioning) */}
                {selectedMarker && (
                    <div className="absolute top-[30%] md:top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 pointer-events-auto z-50 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="pr-2">
                                <h3 className="font-bold text-primary text-lg leading-tight">{selectedMarker.name}</h3>
                                <p className="text-muted text-xs font-medium mt-1">{selectedMarker.status || `Stop at ${selectedMarker.time}`}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMarker(null)}
                                className="text-muted hover:text-primary transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {selectedMarker.image && (
                            <div className="w-full h-[120px] rounded-lg bg-cover bg-center relative overflow-hidden">
                                <img src={selectedMarker.image} alt={selectedMarker.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        )}

                        <div className="flex gap-2 mt-1">
                            <button className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
                                <span className="material-symbols-outlined text-[18px]">navigation</span>
                                Navigate
                            </button>
                            <button
                                onClick={() => {
                                    onOpenStream();
                                }}
                                className="flex-1 py-2.5 bg-background-light text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom map controls */}
                <div className="w-full p-6 pb-[120px] flex items-end justify-between pointer-events-none">
                    <div></div>

                    {/* List View Toggle FAB */}
                    <button
                        onClick={onOpenStream}
                        className="pointer-events-auto group flex items-center gap-3 bg-primary text-white pl-5 pr-6 py-4 rounded-full shadow-floating hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">format_list_bulleted</span>
                        <span className="font-bold text-base tracking-wide">Stream</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
