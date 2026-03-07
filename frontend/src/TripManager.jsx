import React from 'react';

export default function TripManager({ onSelectTrip }) {
    const trips = [
        {
            id: 'tokyo-1',
            title: 'Tokyo Day 1',
            stops: 5,
            duration: '4h 30m',
            status: 'upcoming',
            svgPath: 'M20 60 C50 60, 60 20, 90 20 C120 20, 130 50, 160 40 L180 30',
            svgStops: [
                { cx: 20, cy: 60, r: 4, type: 'start' },
                { cx: 90, cy: 20, r: 4, type: 'mid' },
                { cx: 160, cy: 40, r: 4, type: 'mid' },
                { cx: 180, cy: 30, r: 4, type: 'end' }
            ]
        },
        {
            id: 'kyoto-1',
            title: 'Kyoto Temples',
            stops: 3,
            duration: '6h 15m',
            status: 'upcoming',
            svgPath: 'M30 30 L80 60 L140 20',
            svgStops: [
                { cx: 30, cy: 30, r: 4, type: 'start' },
                { cx: 80, cy: 60, r: 4, type: 'mid' },
                { cx: 140, cy: 20, r: 4, type: 'end' }
            ]
        },
        {
            id: 'nyc-1',
            title: 'NYC Coffee Run',
            stops: 3,
            duration: '2h 45m',
            status: 'completed',
            svgPath: 'M40 40 C70 40, 70 70, 100 60 C130 50, 130 20, 160 30',
            svgStops: [
                { cx: 40, cy: 40, r: 4, type: 'start' },
                { cx: 100, cy: 60, r: 4, type: 'mid' },
                { cx: 160, cy: 30, r: 4, type: 'end' }
            ]
        }
    ];

    return (
        <div className="flex-1 w-full bg-background-light dark:bg-background-dark font-display text-text-main flex flex-col pt-8 px-4 pb-24 overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary dark:text-white">My Journeys</h1>
                    <p className="text-muted text-sm font-medium mt-1">Where to next?</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-soft flex items-center justify-center text-muted hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined light" style={{ fontSize: '24px' }}>settings</span>
                </button>
            </header>

            {/* Main Content Grid */}
            <main className="grid grid-cols-1 gap-4">

                {/* Create New Card */}
                <button className="group w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-muted/50 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-transparent">
                    <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors duration-300">
                        <span className="material-symbols-outlined">add</span>
                    </div>
                    <span className="text-muted font-bold text-sm group-hover:text-primary transition-colors">Plan a New Trip</span>
                </button>

                {/* Trip Cards */}
                {trips.map(trip => (
                    <div
                        key={trip.id}
                        onClick={() => onSelectTrip(trip)}
                        className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer group relative overflow-hidden ${trip.status === 'completed' ? 'opacity-80 grayscale active:grayscale-0' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-primary dark:text-white group-hover:text-primary-dark transition-colors">
                                    {trip.title}
                                </h2>
                                <div className="flex items-center gap-3 mt-1.5 text-muted">

                                    {trip.status === 'completed' && (
                                        <span className="text-xs font-semibold bg-success/20 text-success px-2 py-1 rounded-lg flex items-center gap-1">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>
                                            Completed
                                        </span>
                                    )}
                                    {trip.status !== 'completed' && (
                                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                            {trip.stops} stops
                                        </span>
                                    )}

                                    <span className="text-xs font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined light" style={{ fontSize: '14px' }}>schedule</span>
                                        {trip.duration}
                                    </span>
                                </div>
                            </div>
                            <button className="text-muted/50 hover:text-primary transition-colors py-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_horiz</span>
                            </button>
                        </div>

                        {/* Abstract Route Preview */}
                        <div className={`h-28 w-full rounded-xl relative overflow-hidden flex items-center justify-center ${trip.status === 'completed' ? 'bg-gray-100' : 'bg-highlight/10'}`}>

                            {/* Decorative Map Elements */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: `radial-gradient(${trip.status === 'completed' ? '#94a3b8' : '#E6B89C'} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
                            ></div>

                            {/* Route SVG */}
                            <svg
                                className="drop-shadow-sm transform group-hover:scale-105 transition-transform duration-500"
                                fill="none" height="80" viewBox="0 0 200 80" width="200" xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d={trip.svgPath}
                                    stroke={trip.status === 'completed' ? '#94a3b8' : '#E6B89C'}
                                    strokeDasharray={trip.status === 'completed' ? '6 4' : 'none'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                ></path>
                                {trip.svgStops.map((c, i) => (
                                    <circle
                                        key={i}
                                        cx={c.cx}
                                        cy={c.cy}
                                        r={c.r}
                                        fill={c.type === 'end' && trip.status !== 'completed' ? '#E6B89C' : '#FFFFFF'}
                                        stroke={trip.status === 'completed' ? '#94a3b8' : '#E6B89C'}
                                        strokeWidth="2"
                                    ></circle>
                                ))}
                            </svg>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
